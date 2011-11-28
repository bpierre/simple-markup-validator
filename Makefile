ifeq ($(TOPSRCDIR),)
  export TOPSRCDIR = $(shell pwd)
endif

.PHONY: clean

xpi:
	mkdir -p $(TOPSRCDIR)/build && \
	cd $(TOPSRCDIR) && \
	zip -r $(TOPSRCDIR)/build/simple-markup-validator.xpi chrome chrome.manifest defaults icon.png install.rdf LICENSE && \
	cd $(TOPSRCDIR)

clean:
	rm -rf $(TOPSRCDIR)/build

help:
	@echo Targets:
	@echo xpi
	@echo clean
