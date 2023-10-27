# Status

This workspace is separate from its test target of `fe/` to `appTest/` in order
to make make installation of its dependencies optional.

# Setting up and running the tests

The server should be runing in the background for the tests to run. The 
following script delineates the procedure but is intended to serve as a
guideline as it, for example, doesn't describe how to stop the preview server
after testing. This is OS specific and up to the tester to decide. He may prefer
to launch the server in parallel from a single terminal console or use two
terminals.

The `VITE_THEME_OVERRIDE` environment variable must be set to 
`themeLight`/`themeDark`in order to test both color themes when launching the
`build` and `lighthouse`/`pa11y` npm scripts so as to write the reports with the
proper filenames.

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
reports will be linked from the accessibility in the running app.
