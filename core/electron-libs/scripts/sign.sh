#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2
NEEDS_UNZIP=false

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    zip -r -q -y unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# sign with curl
mkdir -p signed
curl -f -o "signed/${INPUT}" -F file=@"${INPUT}" -F entitlements=@"${ENTITLEMENTS}" https://cbi.eclipse.org/macos/codesign/sign

ls -a
ls -a ..

# if unzip needed
if [ "$NEEDS_UNZIP" = true ]; then
    unzip -qq "signed/${INPUT}"

    if [ $? -ne 0 ]; then
        # echo contents if unzip failed
        output=$(cat "signed/${INPUT}")
        echo "$output"
        exit 1
    fi

    rm -f "signed/${INPUT}"
fi
