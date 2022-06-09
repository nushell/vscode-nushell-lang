#!/usr/bin/env nu
ls
|where ($it.name|path parse|get extension) == vsix
|get name.0
|code --install-extension $in