#! /bin/sh

cd ~/Projects/maps/azt/data
pwd
for i in 0{1..9} {10..43}
do
    togeojson pass_${i}_gps.gpx > pass_${i}.geojson
done
exit 0
