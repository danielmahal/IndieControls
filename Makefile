BUNDLE = bin/bundle
STYLUS = node_modules/.bin/stylus

all: rocket

rocket: examples/rocket/build \
		examples/rocket/build/app.js \
		examples/rocket/build/vendor.js \
		examples/rocket/build/app.css

examples/rocket/build:
	@mkdir -p $@

examples/rocket/build/app.js: $(shell find examples/rocket/src/scripts)
	$(BUNDLE) ./examples/rocket/src/scripts/app.js > $@

examples/rocket/build/vendor.js: \
	examples/rocket/vendor/physicsjs-full-0.5.3.js
	cat $^ > $@

examples/rocket/build/%.css: examples/rocket/src/styles/%.styl
	$(STYLUS) -u nib -I examples/rocket/src/styles < $< > $@
