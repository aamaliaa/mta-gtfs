#!/bin/sh

# MTA subway GTFS schedule data is refreshed whenever warranted by service changes,
# on average about every 4 months and available here:
# http://web.mta.info/developers/developer-data-terms.html#data
#
# This script downloads the zipped package and moves the new files to lib/data/gtfs

mkdir tmp
curl -sS http://web.mta.info/developers/data/nyct/subway/google_transit.zip > tmp/mta_gtfs.zip
unzip tmp/mta_gtfs.zip -d tmp
rm tmp/mta_gtfs.zip
cp -a tmp/. lib/data/gtfs
rm -r tmp
