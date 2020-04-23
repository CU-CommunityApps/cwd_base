#!/bin/sh

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

node-sass -r -w --output-style=nested --source-map=true --output=css sass