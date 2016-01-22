#!/bin/bash

# this file is the bash wrapper to launch concierge. just a single command
# to run the script with node. because sabnzbd requires you to set one dir
# for all your scripts, you should probably copy this file to the directory
# where all your other scripts are.
#
# don't forget to make it executable.
#
# make the following line the correct path to your concierge
nodejs /srv/concierge/conciergeSabnzbd.js "$@"
