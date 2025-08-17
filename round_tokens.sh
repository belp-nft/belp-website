#!/bin/bash

# Script to round all PNG images in the tokens folder
# Usage: ./round_tokens.sh

TOKENS_DIR="/Users/jackbereson/Projects/belpy/belp-website/public/icons/tokens"
RADIUS=60  # Border radius in pixels (equivalent to rounded-2xl)

echo "🎨 Starting to round token images..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick is not installed. Installing via Homebrew..."
    brew install imagemagick
fi

# Navigate to tokens directory
cd "$TOKENS_DIR" || exit 1

# Create backup directory
echo "📁 Creating backup..."
mkdir -p backup
cp *.png backup/ 2>/dev/null || echo "⚠️  No PNG files found to backup"

# Process each PNG file
for file in *.png; do
    if [ -f "$file" ]; then
        echo "🔄 Processing: $file"
        
        # Create rounded version
        magick "$file" \
            \( +clone -alpha extract \
               -draw "fill black polygon 0,0 0,$RADIUS $RADIUS,0 \
                      fill white circle $RADIUS,$RADIUS $RADIUS,0" \
               \( +clone -flip \) -compose Multiply -composite \
               \( +clone -flop \) -compose Multiply -composite \
            \) -alpha off -compose CopyOpacity -composite \
            "temp_$file"
        
        # Replace original with rounded version
        mv "temp_$file" "$file"
        echo "✅ Completed: $file"
    fi
done

echo "🎉 All token images have been rounded!"
echo "💾 Original files backed up in: $TOKENS_DIR/backup/"