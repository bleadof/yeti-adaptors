# jasmine Yeti adaptor

Super simple adaptor you can drop straight into your jasmine test suite. Place the `jasmine-yeti-adaptor.js` file right after the jasmine file.

In order for Yeti to know what to pass back and if any tests failed etc you need to do a small bit of setup code.

```js
var jasmineEnv = jasmine.getEnv();

jasmineEnv.addReporter(new jasmine.TrivialReporter());

// If you're not running it through Yeti don't call the hookup method
if (window.$yetify !== undefined) {
    BUNYIP.hookup(jasmineEnv);
}
    
jasmineEnv.execute();
```

You'll need to get the runner environment and pass it into the `BUNYIP.hookup` method.

Now when you run your test suite through yeti it'll work!