# AppleScript for Visual Studio Code

[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/release/idleberg/vscode-applescript.svg?style=flat-square)](https://github.com/idleberg/vscode-applescript/releases)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/idleberg.applescript.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=idleberg.applescript)
[![Travis](https://img.shields.io/travis/idleberg/vscode-applescript.svg?style=flat-square)](https://travis-ci.org/idleberg/vscode-applescript)
[![David](https://img.shields.io/david/dev/idleberg/vscode-applescript.svg?style=flat-square)](https://david-dm.org/idleberg/vscode-applescript?type=dev)

Language syntax, snippets and build system for AppleScript and JavaScript for Automation

![Screenshot](https://raw.githubusercontent.com/idleberg/vscode-applescript/master/images/screenshot.png)

*Screenshot of AppleScript in Visual Studio Code with [Hopscotch](https://marketplace.visualstudio.com/items?itemName=idleberg.hopscotch) theme*

## Installation

### Extension Marketplace

Click the Extensions icon in the activity bar and search for *idleberg.applescript*. With shell commands installed, you can use the following command to install the extension:

```bash
$ code --install-extension idleberg.applescript
```

### Packaged Extension

Download the package extension from the the [release page](https://github.com/idleberg/vscode-applescript/releases) and install it from the command-line:

```bash
$ code --install-extension applescript-*.vsix
```

### Clone Repository

Change to your Visual Studio Code extensions directory:

```bash
# Windows
$ cd %USERPROFILE%\.vscode\extensions

# Linux & macOS
$ cd ~/.vscode/extensions/
```

Clone repository as `applescript`:

```bash
$ git clone https://github.com/idleberg/vscode-applescript applescript
```

## Usage

### Building

On macOS, you can make use of the following build commands through the [command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette):

* AppleScript: Run Script – <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>R</kbd>
* AppleScript: Compile Script – <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>B</kbd>
* AppleScript: Compile Script bundle
* AppleScript: Compile Application
* JXA: Run Script – <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>R</kbd>
* JXA: Compile Script – <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>B</kbd>
* JXA: Compile Script bundle
* JXA: Compile Application

## License

This work is licensed under [The MIT License](https://opensource.org/licenses/MIT)

## Donate

You are welcome support this project using [Flattr](https://flattr.com/submit/auto?user_id=idleberg&url=https://github.com/idleberg/vscode-applescript) or Bitcoin `17CXJuPsmhuTzFV2k4RKYwpEHVjskJktRd`
