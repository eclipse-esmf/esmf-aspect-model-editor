;--------------------------------
;Include Modern UI

  !include MUI2.nsh
  !include nsDialogs.nsh
  !include LogicLib.nsh

  !define MUI_ICON "..\core\apps\ame\src\assets\img\svg\icon.svg"
;--------------------------------
;General

  ;Name and file
  Name "Aspect Model Editor"
  Unicode True

  OutFile "aspect-model-editor-${VERSION}-win.exe"

  ;Default installation folder
  InstallDir "$LOCALAPPDATA\ASPECT-MODEL-EDITOR"

  ;Get installation folder from registry if available
  InstallDirRegKey HKCU "Software\ASPECT-MODEL-EDITOR" ""

;--------------------------------
;Interface Settings

  !define MUI_ABORTWARNING
  !define MUI_LANGDLL_ALLLANGUAGES

;--------------------------------
;Pages
  !insertmacro MUI_PAGE_WELCOME

  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  !insertmacro MUI_PAGE_FINISH

  !define MUI_WELCOMEPAGE_TEXT "MAKE SURE ALL INSTANCES OF THE ASPECT MODEL EDITOR ARE CLOSED BEFORE STARTING THE UNINSTALLATION !  $\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_UNPAGE_WELCOME
  !insertmacro MUI_UNPAGE_INSTFILES
  !insertmacro MUI_UNPAGE_FINISH

;--------------------------------
;Languages

  !insertmacro MUI_LANGUAGE "English"

;--------------------------------
;Installer Sections

Section "Install"
; Sets the context of $SMPROGRAMS and other shell folders.
; If set to 'current' (the default), the current user's shell folders are used.
; If set to 'all', the 'all users' shell folder is used.
  SetShellVarContext all
  SetOutPath "$INSTDIR"

  ExecWait 'icacls "$INSTDIR" /grant *S-1-5-19:(OI)(CI)F /T'

  Call uninstall_Previous_Version
  Call install_AME

  ;Store installation folder
  WriteRegStr HKCU "Software\ASPECT-MODEL-EDITOR" "" $INSTDIR

  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" \
                   "DisplayName" "Aspect Model Editor"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" \
                   "Publisher" "open-manufacturing.org"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" \
                   "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" \
                   "UninstallString" "$INSTDIR\uninstall.exe"

SectionEnd

;--------------------------------
;Uninstaller Section

Section "Uninstall"
; Sets the context of $SMPROGRAMS and other shell folders.
; If set to 'current' (the default), the current user's shell folders are used.
; If set to 'all', the 'all users' shell folder is used.
  SetShellVarContext all
  ExecWait "TaskKill /IM Aspect-Model-Editor.exe /F"

  Call un.install_AME

  Delete "$INSTDIR\Uninstall.exe"

  DeleteRegKey /ifempty HKCU "Software\ASPECT-MODEL-EDITOR"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR"
SectionEnd

;--------------------------------
;Function

Function install_AME
    File /r "..\core\electron\win-unpacked\*"

    CreateDirectory "$SMPROGRAMS\OMP"

    CreateShortCut "$SMPROGRAMS\OMP\Aspect-Model-Editor.lnk" "$INSTDIR\Aspect-Model-Editor.exe"
    CreateShortCut "$SMPROGRAMS\OMP\Aspect-Model-Editor Uninstaller.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortCut "$DESKTOP\Aspect-Model-Editor.lnk" "$INSTDIR\Aspect-Model-Editor.exe"
FunctionEnd

Function un.install_AME
    RMDir /r "$INSTDIR"

    Delete "$SMPROGRAMS\OMP\Aspect-Model-Editor.lnk"
    Delete "$SMPROGRAMS\OMP\Aspect-Model-Editor Uninstaller.lnk"
    RMDir /r  "$SMPROGRAMS\OMP"

    Delete "$DESKTOP\Aspect-Model-Editor.lnk"
FunctionEnd

;WOW6432Node automatically added by windows for 64 bits applications
Function uninstall_Previous_Version
    ; Check for uninstaller.
    ReadRegStr $R0 HKLM "SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" "UninstallString"

    ${If} $R0 != ""
            ExecWait '"$R0" /S'
            Sleep 10000
    ${EndIf}
FunctionEnd
