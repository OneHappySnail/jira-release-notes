@echo off

CALL npm run release
IF %ERRORLEVEL% NEQ 0 (
   ECHO Failed to generate release notes.
   EXIT /B %ERRORLEVEL%
)
