package com.threeshamrocks.j8nix;

import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

/** Opens the live J8NIX web app full screen as a Trusted Web Activity. */
public class LauncherActivity extends com.google.androidbrowserhelper.trusted.LauncherActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Portrait, as in the web manifest. Android 8.0 rejects a fixed orientation
        // on translucent activities, so it is skipped there.
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.O) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER_PORTRAIT);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }

    @Override
    protected Uri getLaunchingUrl() {
        // Shortcut and deep-link URLs arrive as intent data; otherwise the default start URL.
        return super.getLaunchingUrl();
    }
}
