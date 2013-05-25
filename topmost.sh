#!/bin/bash

touch /var/log/frontmost.log

while [ 1 ]
do
	osascript frontapp.as >>/var/log/frontmost.log
	sleep 1
done
