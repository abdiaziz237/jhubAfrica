@echo off
echo Starting MongoDB...
start /B mongod --dbpath C:\data\db
timeout /t 3 /nobreak > nul
echo MongoDB should be running now.
