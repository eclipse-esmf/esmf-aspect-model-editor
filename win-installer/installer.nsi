;--------------------------------
;Include Modern UI

  !include MUI2.nsh
  !include nsDialogs.nsh
  !include LogicLib.nsh

  !define MUI_ICON "..\core\apps\ame\src\assets\img\ico\aspect-model-editor-targetsize-192.ico"

;--------------------------------
;General

  ;Name and file
  Name "Aspect Model Editor"
  Unicode True

  OutFile "aspect-model-editor-v${VERSION}-win.exe"

  ; "highest" requests the highest level the current user already has.
  ; Admins get elevated (UAC prompt), standard users do not.
  ; This avoids forcing a UAC prompt for a per-user install into $LOCALAPPDATA.
  RequestExecutionLevel highest

  ;Default installation folder
  InstallDir "$LOCALAPPDATA\ASPECT-MODEL-EDITOR"
  !define MUI_CUSTOMFUNCTION_GUIINIT GuiInit
  ;Get installation folder from registry if available
  InstallDirRegKey HKCU "Software\ASPECT-MODEL-EDITOR" ""

;--------------------------------
;Interface Settings

  !define MUI_ABORTWARNING
  !define MUI_LANGDLL_ALLLANGUAGES

;--------------------------------
;Pages
  !insertmacro MUI_PAGE_WELCOME

  !define MUI_PAGE_CUSTOMFUNCTION_LEAVE DirectoryLeave
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
  ; Use 'all' shell folders (All Users Start Menu etc.) only when running as admin.
  ; Standard users fall back to 'current' (per-user Start Menu / Desktop).
  UserInfo::GetAccountType
  Pop $1
  ${If} $1 == "Admin"
    SetShellVarContext all
  ${Else}
    SetShellVarContext current
  ${EndIf}

  SetOutPath "$INSTDIR"

  ; $LOCALAPPDATA is already fully owned by the current user — no icacls needed.
  ; For admin installs the directory may differ; icacls is only required when
  ; installing to a shared location (e.g. $PROGRAMFILES), which is not the case here.

  Call uninstall_Previous_Version
  Call install_AME

  ;Store installation folder
  WriteRegStr HKCU "Software\ASPECT-MODEL-EDITOR" "" $INSTDIR

  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Write Add/Remove Programs entry -- use HKLM for admins, fall back to HKCU for standard users
  !define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR"
  UserInfo::GetAccountType
  Pop $1
  ${If} $1 == "Admin"
    WriteRegStr HKLM "${UNINST_KEY}" "DisplayName"     "Aspect Model Editor"
    WriteRegStr HKLM "${UNINST_KEY}" "Publisher"       "eclipse.org"
    WriteRegStr HKLM "${UNINST_KEY}" "DisplayVersion"  "${VERSION}"
    WriteRegStr HKLM "${UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKLM "${UNINST_KEY}" "DisplayIcon"     "$INSTDIR\Aspect-Model-Editor.exe"
    WriteRegStr HKLM "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
    WriteRegDWORD HKLM "${UNINST_KEY}" "NoModify"      1
    WriteRegDWORD HKLM "${UNINST_KEY}" "NoRepair"      1
  ${Else}
    WriteRegStr HKCU "${UNINST_KEY}" "DisplayName"     "Aspect Model Editor"
    WriteRegStr HKCU "${UNINST_KEY}" "Publisher"       "eclipse.org"
    WriteRegStr HKCU "${UNINST_KEY}" "DisplayVersion"  "${VERSION}"
    WriteRegStr HKCU "${UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "${UNINST_KEY}" "DisplayIcon"     "$INSTDIR\Aspect-Model-Editor.exe"
    WriteRegStr HKCU "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
    WriteRegDWORD HKCU "${UNINST_KEY}" "NoModify"      1
    WriteRegDWORD HKCU "${UNINST_KEY}" "NoRepair"      1
  ${EndIf}

SectionEnd

;--------------------------------
;Uninstaller Section

Section "Uninstall"
  ; Mirror the same shell context used during install so shortcuts are found
  ; and deleted from the correct location (All Users vs. current user).
  UserInfo::GetAccountType
  Pop $1
  ${If} $1 == "Admin"
    SetShellVarContext all
  ${Else}
    SetShellVarContext current
  ${EndIf}

  ExecWait "TaskKill /IM Aspect-Model-Editor.exe /F"

  Call un.install_AME

  Delete "$INSTDIR\Uninstall.exe"

  ; Remove Add/Remove Programs entry from the same hive it was written to
  UserInfo::GetAccountType
  Pop $1
  ${If} $1 == "Admin"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR"
  ${Else}
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR"
  ${EndIf}
  DeleteRegKey /ifempty HKCU "Software\ASPECT-MODEL-EDITOR"
SectionEnd

;--------------------------------
; Hidden section used only for disk space calculation in GuiInit
Section "-SpaceRequired" SEC_SPACE
SectionEnd

;--------------------------------
;Functions

Function DirectoryLeave
    ExpandEnvStrings $0 "%USERPROFILE%\ASPECT-MODEL-EDITOR"

    ${If} $INSTDIR == $0
      MessageBox MB_OK|MB_ICONEXCLAMATION "The installation directory must not be directly under C:\Users\<username>\aspect-model-editor. Please choose a different path (e.g. a subfolder).$\r$\n$\r$\n"
      Abort
    ${EndIf}
FunctionEnd

Function install_AME
    File /r "..\core\.electron\win-unpacked\*"

    CreateDirectory "$SMPROGRAMS\ESMF"

    CreateShortCut "$SMPROGRAMS\ESMF\Aspect-Model-Editor.lnk" "$INSTDIR\Aspect-Model-Editor.exe"
    CreateShortCut "$SMPROGRAMS\ESMF\Aspect-Model-Editor Uninstaller.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortCut "$DESKTOP\Aspect-Model-Editor.lnk" "$INSTDIR\Aspect-Model-Editor.exe"

    ExpandEnvStrings $0 "%USERPROFILE%\aspect-model-editor\models"
    CreateDirectory "$0"
FunctionEnd

Function un.install_AME
    RMDir /r "$INSTDIR"

    Delete "$SMPROGRAMS\ESMF\Aspect-Model-Editor.lnk"
    Delete "$SMPROGRAMS\ESMF\Aspect-Model-Editor Uninstaller.lnk"
    RMDir /r "$SMPROGRAMS\ESMF"

    Delete "$DESKTOP\Aspect-Model-Editor.lnk"
FunctionEnd

; Check all three possible registry locations for a previous installation:
; 1. HKLM native 64-bit (installed by admin)
; 2. HKLM WOW6432Node 32-bit (installed by admin on 64-bit OS, legacy)
; 3. HKCU (installed by standard user)
Function uninstall_Previous_Version
    ReadRegStr $R0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" "UninstallString"
    ${If} $R0 == ""
        ReadRegStr $R0 HKLM "SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" "UninstallString"
    ${EndIf}
    ${If} $R0 == ""
        ReadRegStr $R0 HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ASPECT-MODEL-EDITOR" "UninstallString"
    ${EndIf}

    ${If} $R0 != ""
        ExecWait '"$R0" /S'
        Sleep 10000
    ${EndIf}
FunctionEnd

; FIX: Use GetFileSize (System plugin) instead of FileSeek to correctly handle files larger than 2 GB
Function FileSizeNew
    Exch $0
    Push $1
    Push $2
    System::Call "kernel32::GetFileAttributesEx(t '$0', i 0, @r1)"
    System::Call "*$1(i, l, l, l, l .r2, l)"
    IntOp $0 $2 / 1024
    Pop $2
    Pop $1
    Exch $0
FunctionEnd

; FIX: Use correct section index constant ${SEC_SPACE} instead of ${SpaceRequired}
Function GuiInit
    Push "$INSTDIR\Aspect-Model-Editor.exe"
    Call FileSizeNew
    Pop $0
    SectionSetSize ${SEC_SPACE} $0
FunctionEnd
