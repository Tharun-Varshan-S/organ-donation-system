#!/bin/bash
echo "Syncing to ~/react-blood-ui..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='pnpm-lock.yaml' . ~/react-blood-ui/
cd ~/react-blood-ui
pnpm dev
