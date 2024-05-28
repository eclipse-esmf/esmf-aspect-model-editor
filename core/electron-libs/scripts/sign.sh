#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2
ROOT_DIR=$3
NEEDS_UNZIP=false

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    zip -r -q -y unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# sign with curl
mkdir -p "${ROOT_DIR}/signed"
curl -f -o "${ROOT_DIR}/signed/${INPUT}" -F file=@"${INPUT}" -F entitlements=@"${ENTITLEMENTS}" https://cbi.eclipse.org/macos/codesign/sign

ls -a "${ROOT_DIR}"
ls -a "${ROOT_DIR}/signed"

# if unzip needed
if [ "$NEEDS_UNZIP" = true ]; then
    unzip -qq "${ROOT_DIR}/signed/${INPUT}"

    if [ $? -ne 0 ]; then
        # echo contents if unzip failed
        output=$(cat "${ROOT_DIR}/signed/${INPUT}")
        echo "$output"
        exit 1
    fi

    rm -f "${ROOT_DIR}/signed/${INPUT}"
fi
