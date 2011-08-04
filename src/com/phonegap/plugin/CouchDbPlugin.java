package com.phonegap.plugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.util.Log;

import com.couchbase.libcouch.AndCouch;
import com.couchbase.libcouch.CouchDB;
import com.couchbase.libcouch.ICouchClient;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

public class CouchDbPlugin extends Plugin {
	
	protected static final String TAG = "CouchDbPlugin";
	public static final String PREFS_NAME = "CouchDbPrefs";
	private ServiceConnection couchServiceConnection;
	private String url = null;
	private String dbName = null;
	private String callbackId = null;
	
	private String getSyncPoint() {
		SharedPreferences settings = this.ctx.getSharedPreferences(PREFS_NAME, 0);
		String syncPoint = settings.getString("syncpoint", "http://couchbase.ic.ht/photo-share");
		return syncPoint;
	}

	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		Log.d(TAG, "CouchDbPlugin called with "+action);
		PluginResult result = null;
		this.callbackId = callbackId;
		if(action.equals("start")) {
			startCouch();
			result = new PluginResult(Status.NO_RESULT);
			result.setKeepCallback(true);
		}
		else if(action.equals("save")) {
			try {
				result = save(data.get(0).toString());
			}
			catch(JSONException e) {
				Log.e(TAG, "Error whith image "+e.getMessage());
			}
		}
		else if(action.equals("list")) {
			result = list();
		}
		else if(action.equals("fetch")) {
			try {
				result = fetch(data.get(0).toString());
			} catch (JSONException e) {
				Log.e(TAG, "Error whith image " + e.getMessage());
			}
		}
		return result;
	}
	
	private void couchError() {
		Log.e(TAG, "ERROR");
	}
	
	/*
	* Will check for the existence of the photoshare database and create it if it doesn't exist,
	*/
	private void ensureDoc(String dbName, String url) {

		try {
			this.url = url;
			this.dbName = dbName;
			String ddocUrl = url + dbName;
			Log.d(TAG, "ddocUrl: "+ddocUrl);

			AndCouch req = AndCouch.get(ddocUrl);

			if (req.status == 404) {
				req = AndCouch.put(url + dbName, null);
				Log.d(TAG, "New DOC "+req.status);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	/*
	 * CouchClient implementation
	 */
	private final ICouchClient mCallback = new ICouchClient.Stub() {
		@Override
		public void couchStarted(String host, int port) {
			String url = "http://" + host + ":" + Integer.toString(port) + "/";
			ensureDoc("photoshare", url);
			String syncPoint = getSyncPoint();
			//success(new PluginResult(Status.OK, "{\"syncpoint\":"+syncPoint+",\"message\":\"CouchDB started!\"}"), callbackId);
			try {
				JSONObject startObj = new JSONObject();
				startObj.put("message", "Couch Started!");
				startObj.put("syncpoint", syncPoint);
				success(new PluginResult(Status.OK, startObj), callbackId);
				// Log.d(TAG, (new PluginResult(Status.OK,
				// "Couch Started!")).toSuccessCallbackString(callbackId));
				Log.d(TAG, "Couch Started!");
			} catch(JSONException e) {
				Log.e(TAG, "Error while creating response message");
				e.printStackTrace();
			}
		}

		@Override
		public void installing(int completed, int total) {
			sendJavascript(String.format("CouchDbPlugin.installStatus(%d,%d);", completed, total));
			Log.d(TAG, "CouchDb Installing "+completed+"/"+total);
		}

		@Override
		public void exit(String error) {
			Log.v(TAG, error);
			couchError();
		}
	};
	/*
	 * Saves an image into the CouchDB database
	 * @param imageData the JSON image data stringified
	 * @return A PluginResult
	 */
	private PluginResult save(String imageData) {
		PluginResult result = null;
		try {
			Log.d(TAG, "Saving image to "+this.url + this.dbName);
			AndCouch req = AndCouch.post(this.url + this.dbName, imageData);
			if(req.status != 201) {
				result = new PluginResult(Status.OK, "Error while saving image, status code: "+req.status);
			}
			else {
				result = new PluginResult(Status.OK, "Image saved "+req.status);
			}
		} catch (JSONException e) {
			e.printStackTrace();
			result = new PluginResult(Status.JSON_EXCEPTION, "Error while saving the image: "+e.getMessage());
		}
		return result;
	}
	/*
	 * Lists images currently in the CouchDB database
	 * @return a PluginResult with the JSON data return from the CouchDB
	 */
	private PluginResult list() {		
		PluginResult result = null;
		try {
			String allDocs = this.url+this.dbName+"/_all_docs";
			Log.d(TAG, "Listing "+allDocs);
			AndCouch req = AndCouch.get(allDocs);
			result = new PluginResult(Status.OK, req.json.toString());
			//Log.d(TAG, req.json.toString());
		} catch (JSONException e) {
			e.printStackTrace();
			result = new PluginResult(Status.JSON_EXCEPTION, "Error while listing data: "+e.getMessage());
		}
		return result;
	}
	
	private PluginResult fetch(String id) {
		PluginResult result = null;
		try {
			String doc = this.url+this.dbName+"/"+id;
			Log.d(TAG, "Fetching "+doc);
			AndCouch req = AndCouch.get(doc);
			result = new PluginResult(Status.OK, req.json.toString());
			//Log.d(TAG, req.json.toString());
		} catch (JSONException e) {
			e.printStackTrace();
			result = new PluginResult(Status.JSON_EXCEPTION, "Error while fetching image: "+e.getMessage());
		}
		return result;
	}
	
	private void startCouch() {
		Log.d(TAG, "Starting CouchDB");
		couchServiceConnection = CouchDB.getService(this.ctx.getBaseContext(), null, "release-0.1", mCallback);
	}
	
	@Override
	public void onDestroy() {
		super.onDestroy();
		try {
			this.ctx.unbindService(couchServiceConnection);
		} catch (IllegalArgumentException e) {
		}
	}

}
