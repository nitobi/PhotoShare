package com.phonegap.plugin;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.ServiceConnection;
import android.util.Log;

import com.couchbase.libcouch.AndCouch;
import com.couchbase.libcouch.CouchDB;
import com.couchbase.libcouch.ICouchClient;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

public class CouchDbPlugin extends Plugin {
	
	protected static final String TAG = "CouchDbPlugin";
	private ServiceConnection couchServiceConnection;
	private String url = null;
	private String dbName = null;

	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		Log.d(TAG, "CouchDbPlugin called");
		PluginResult result = null;
		if(action.equals("start")) {
			startCouch();
			result = new PluginResult(Status.OK, "CouchDB is starting...");
		}
		else if(action.equals("save")) {
			Log.d(TAG, "save action called");
			try {
				Log.d(TAG, data.toString());
				result = save(data.get(0).toString());
			}
			catch(JSONException e) {
				Log.e(TAG, "Error whith image "+e.getMessage());
			}
		}
		else if(action.equals("list")) {
			Log.d(TAG, "list action called");
			result = list();
		}
		else if(action.equals("fetch")) {
			try {
				Log.d(TAG, "fetch action called");
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
	* Will check for the existence of a design doc and if it doesnt exist,
	* upload the json found at dataPath to create it
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
	
	private final ICouchClient mCallback = new ICouchClient.Stub() {
		@Override
		public void couchStarted(String host, int port) {
			String url = "http://" + host + ":" + Integer.toString(port) + "/";
			ensureDoc("couchdb", url);
			Log.d(TAG, "Couch Started!");
		}

		@Override
		public void installing(int completed, int total) {
			Log.d(TAG, "CouchDb Installing "+completed+"/"+total);
		}

		@Override
		public void exit(String error) {
			Log.v(TAG, error);
			couchError();
		}
	};
	
	private PluginResult save(String imageData) {
		PluginResult result = null;
		try {
			Log.d(TAG, "saving "+this.url + this.dbName);
			AndCouch req = AndCouch.post(this.url + this.dbName, imageData);
			result = new PluginResult(Status.OK, "IMAGE SAVED "+req.status);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return result;
	}
	
	private PluginResult list() {		
		PluginResult result = null;
		try {
			String allDocs = this.url+this.dbName+"/_all_docs";
			Log.d(TAG, "List "+allDocs);
			AndCouch req = AndCouch.get(allDocs);
			result = new PluginResult(Status.OK, req.json.toString());
			Log.d(TAG, req.json.toString());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return result;
	}
	
	private PluginResult fetch(String id) {
		PluginResult result = null;
		try {
			String doc = this.url+this.dbName+"/"+id;
			Log.d(TAG, "List "+doc);
			AndCouch req = AndCouch.get(doc);
			result = new PluginResult(Status.OK, req.json.toString());
			Log.d(TAG, req.json.toString());
		} catch (JSONException e) {
			e.printStackTrace();
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
