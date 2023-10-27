# Status

This workspace is currently being moved from its original location inside
of `fe/` to `appTest/` in order to make make installation of its dependencies
optional.

# Setting up and running the tests

The server must be runing in the background for the tests to run.

```
npm i

export VITE_THEME_OVERRIDE=themeLight

cd fe
npm run build
npm run preview &

cd ../appTest
npm i
npm run lighthouse
npm run pa11y

# terminate preview server to switch themes

export VITE_THEME_OVERRIDE=themeDark
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
