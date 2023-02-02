ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

## Global binaries

BIN_NPM:=$(shell which npm)
BIN_MOCHA:=$(shell which mocha)
BIN_NYC:=$(shell which nyc)


.EXPORT_ALL_VARIABLES:


run:


check-binaries: bin-npm-exists bin-mocha-exists bin-nyc-exists
bin-%-exists: ;@which $(shell echo $@ | cut -d '-' -f 2) > /dev/null


install: install-js
install-js:
	${BIN_NPM} install --include=dev


tests: tests-js
tests-js:
	${BIN_MOCHA} --require ${ROOT_DIR}/index.js ${ROOT_DIR}/tests/*-test.js

coverage: coverage-js
coverage-js:
	${BIN_NYC} --reporter=html --report-dir "reports/js" --exclude "tests/" ${BIN_MOCHA} --require ${ROOT_DIR}/index.js ${ROOT_DIR}/tests/*-test.js


valid-full-coverage: valid-full-coverage-js
valid-full-coverage-js:
	$(eval PERCENT_COVERAGE_JS=$(shell ${BIN_NYC} --reporter=text --exclude "tests/" ${BIN_MOCHA} --require ${ROOT_DIR}/index.js ${ROOT_DIR}/tests/*-test.js | grep -E "^All files" | awk '{ print $$10 }'))
	@if [ "$(PERCENT_COVERAGE_JS)" = "100" ]; then echo "OK"; else false; fi


clean:
	rm -rf ${ROOT_DIR}/reports
	rm -rf ${ROOT_DIR}/.nyc_output
clean-all: clean
	rm -rf ${ROOT_DIR}/node_modules ${ROOT_DIR}/package-lock.json
