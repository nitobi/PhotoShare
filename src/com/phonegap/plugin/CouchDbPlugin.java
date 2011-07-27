package com.phonegap.plugin;

import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;

import com.couchbase.libcouch.AndCouch;
import com.couchbase.libcouch.ICouchClient;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public class CouchDbPlugin extends Plugin {
	
	protected static final String TAG = "CouchDbPlugin";

	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		Log.d("CouchDbPlugin", "CouchDbPlugin called");
		return null;
	}
	
	public String getLocalIpAddress() {
		try {
			for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {
				NetworkInterface intf = en.nextElement();
				for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();) {
					InetAddress inetAddress = enumIpAddr.nextElement();
					if (!inetAddress.isLoopbackAddress()) {
						return inetAddress.getHostAddress().toString();
					}
				}
			}
		} catch (SocketException ex) {
			ex.printStackTrace();
		}
		return null;
	}
	
	private void couchError() {
		Log.e("CouchDbPlugin", "ERROR");
	}
	
	/*
	* Will check for the existence of a design doc and if it doesnt exist,
	* upload the json found at dataPath to create it
	*/
	private void ensureDesignDoc(String dbName, String url) {

		try {
			String data = readAsset(this.ctx.getAssets(), dbName + ".json");
			String ddocUrl = url + dbName + "/_design/" + dbName;

			AndCouch req = AndCouch.get(ddocUrl);

			if (req.status == 404) {
				AndCouch.put(url + dbName, null);
				AndCouch.put(ddocUrl, data);
			}

		} catch (IOException e) {
			e.printStackTrace();
			// There is no design doc to load
		} catch (JSONException e) {
			e.printStackTrace();
		}
	};
	
	private final ICouchClient mCallback = new ICouchClient.Stub() {
		@Override
		public void couchStarted(String host, int port) {

			String url = "http://" + host + ":" + Integer.toString(port) + "/";
		    String ip = getLocalIpAddress();
		    String param = (ip == null) ? "" : "?ip=" + ip;

			ensureDesignDoc("mobilefuton", url);
		}

		@Override
		public void installing(int completed, int total) {
			Log.d("CouchDbPlugin", "CouchDb Installing");
		}

		@Override
		public void exit(String error) {
			Log.v(TAG, error);
			couchError();
		}
	};

}
