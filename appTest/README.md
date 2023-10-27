# Status

This directory contains script to test the app developed in `fe/` and `be/`.
We haven't made it into a workspace to speed up installation of the workspaces
(e.g. `puppeteer` requires binaries that might take a long time to be downloaded).

# Setting up and running the tests

The server should be running in the background for the tests to run.

The following script shows the procedure but is intended to serve as a
guideline as it, for example, doesn't describe how to stop the preview server
after testing.

It is OS specific and up to the tester to decide if launching the server in
parallel from a single terminal console or use two terminals.

The `VITE_THEME_OVERRIDE` environment variable must be set to
`themeLight` or `themeDark` in order to test both color themes when launching
the `build` and `lighthouse`|`pa11y` npm scripts so as to write the reports with
the proper filenames.

```
npm i

export VITE_THEME_OVERRIDE=themeLight
# `$env:VITE_THEME_OVERRIDE = "themeLight"` for Windows PowerShell
# `let VITE_THEME_OVERRIDE=themeLight`` for Windows Command line

cd fe
npm run build
npm run preview &

cd ../appTest
npm i
npm run lighthouse
npm run pa11y

# terminate preview server to switch themes

export VITE_THEME_OVERRIDE=themeDark
# see above for other OS

cd ../
npm run build
npm run preview &

cd ../appTest
npm i
npm run lighthouse
npm run pa11y
```

After running the tests you'll find the reports in `fe/static/audits/`. These
reports will be linked from the accessibility statement page in the app.
