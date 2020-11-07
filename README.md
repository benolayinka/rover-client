# rover-client

This is the client side of ben olayinka's telecontrolled rover project

## Setting up your pi

This program is designed to be run on a pi, connected to an Arduino running firmata.

See `/robots` for example configurations.

## Installing dependencies

`npm i`

## Starting the robot

`node johnny` will initialize johnny-five, using the robot profile defined in `.env`. It will also try to connect to a wss server at `app-hostname`.

`./gstreamer.sh` will begin streaming from a pi cam to that same url.

## Environment variables & config
`./gstreamer.sh` preloads variables from a .env file at the root of the project. See `.env.example` for fields that should be configured.