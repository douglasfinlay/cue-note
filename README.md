<h1 align="center">CueNote</h1>
  <p align="center">
    Note-taking utility for ETC Eos Family lighting consoles
    <br />
    <br />
    <a href="https://github.com/douglasfinlay/cue-note/issues/new?template=bug-report.md">Report Bug</a>
    ·
    <a href="https://github.com/douglasfinlay/cue-note/issues/new?template=feature-request.md">Request Feature</a>
  </p>
</div>

![CueNote Screenshot](assets/cue-note-main.png)

> **Warning**  
> This project is under active development and breaking changes are likely. Use
> at your own risk!

## About

CueNote is a desktop utility to remotely add and edit notes in an Eos show file.

## Getting Started

### Prebuilt Binary

CueNote is available for Windows and macOS. Download the latest binary for your platform from the [Releases](https://github.com/douglasfinlay/cue-note/releases) page.

### Building from Source

#### Prerequisites

- [Node.js 16+](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com)

#### Steps

1. Clone this repository

   ```sh
   git clone git@github.com:douglasfinlay/cue-note.git
   ```

2. Install dependencies

   ```sh
   yarn
   ```

3. Run

   ```sh
   yarn start
   ```

## Usage

### Connection

Connect to an Eos console by entering its IP address or hostname.

#### Eos v3.1.0 and Later

Please ensure **Third Party OSC** is enabled in the _Interface Protocols_
section of the Eos Shell.

#### Earlier Eos Versions

CueNote does not currently support connection using a custom port. To work
around this:

1. In the Eos Shell, under _Network > Interface Protocols_:
   1. Enable **UDP Strings & OSC**
   2. Set the OSC TCP mode to **TCP format for OSC 1.1 (SLIP)**.
2. In Eos, under _Setup > System > Show Control > OSC_:
   1. Enable both **OSC RX** and **OSC TX**.
   2. Ensure **OSC TCP Server Ports** contains **3037**.

### Quick Note Buttons

Right-click on a quick note button to change its text. This will automatically
be saved to your local machine without modifying the Eos show file.

## To Do

- [ ] Button to filter cue list to noted cues only
- [ ] Automatically reconnect after connection loss
- [ ] Re-sync when a different show file is loaded
- [ ] Improve UI state management
- [x] Quick note in-place edit
- [x] Quick note keyboard shortcuts
- [x] Styling overhaul
- [x] Move Eos/OSC functionality into a separate library ([node-eos-console](https://github.com/douglasfinlay/node-eos-console))

## Contributing

All contributions are greatly appreciated. Please feel free to [open issues](https://github.com/douglasfinlay/cue-note/issues/new/choose) to help this project develop.

## License

CueNote is licensed under the MIT license. See [`LICENSE`](https://github.com/douglasfinlay/cue-note/blob/main/LICENSE) for details.

## Disclaimer

This project is in no way affiliated with [ETC](https://www.etcconnect.com/).
