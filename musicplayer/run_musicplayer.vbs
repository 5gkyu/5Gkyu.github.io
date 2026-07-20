Set shell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
batPath = scriptDir & "\\run_musicplayer.bat"
shell.Run Chr(34) & batPath & Chr(34), 0, False
