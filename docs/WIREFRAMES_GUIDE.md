# StockMaster Wireframes Guide

## Overview

This document describes the component-level wireframes for StockMaster Inventory Management System. The wireframes are provided in Figma-compatible JSON format (`FIGMA_WIREFRAMES.json`).

## Wireframe Structure

The JSON file contains:
- **Pages**: Complete page layouts for all major screens
- **Components**: Reusable UI components
- **Design Tokens**: Color palette, spacing, typography, and shadows

## Pages Included

### 1. Authentication (`page-auth`)
- **Login Form**: Email/password login with remember me
- **Signup Form**: User registration with role selection

### 2. Dashboard (`page-dashboard`)
- **KPI Cards**: Total products, stock value, low stock count, today's activity
- **Filters**: Warehouse, date range, category filters
- **Stock Chart**: Bar chart showing stock value by warehouse
- **Recent Activity Feed**: Real-time activity stream

### 3. Products (`page-products`)
- **Products List**: Table with SKU, name, category, stock, prices, warehouses
- **Product Detail Modal**: Tabs for overview, stock by warehouse, variants
- **Search & Filters**: Product search and category filtering
- **Bulk Import**: CSV import functionality

### 4. Receipts (`page-receipts`)
- **Receipts List**: Table of all incoming receipts
- **Receipt Form**: Create receipt with supplier, warehouse, and line items

### 5. Deliveries (`page-deliveries`)
- **Deliveries List**: Table of all outgoing shipments
- **Delivery Form**: Create delivery with customer, warehouse, and line items

### 6. Transfers (`page-transfers`)
- **Transfers List**: Table of internal warehouse transfers
- **Transfer Form**: Create transfer with from/to warehouses and line items

### 7. Stock Adjustments (`page-adjustments`)
- **Adjustment Form**: Adjust stock with product, warehouse, quantity, reason, notes
- **Confirmation Modal**: Shows before/after quantities and warehouse breakdown
- **Photo Upload**: Optional photo attachment for adjustments

### 8. Move History Ledger (`page-ledger`)
- **Ledger Table**: Immutable audit log of all stock movements
- **Filters**: Event type, product, warehouse, date range
- **Columns**: Timestamp, type, product, warehouse, before/after quantities, delta, reason, user

### 9. Warehouse Settings (`page-warehouses`)
- **Warehouse List**: Grid of warehouse cards
- **Warehouse Form**: Create/edit warehouse with name, code, address, contact, timezone

## Shared Components

### Sidebar Navigation
- Logo and navigation menu
- Active state highlighting
- Collapsible on mobile

### Top Bar
- Global search
- Notifications bell with badge
- User menu with avatar and role

## Design Tokens

### Colors
- **Primary Background**: `#0F172A` (Deep Indigo)
- **Surface**: `#0B1020` (Soft Charcoal)
- **Accent**: `#FF6B6B` (Electric Coral)
- **Success**: `#A3E635` (Vivid Chartreuse)
- **Muted**: `#94A3B8` (Cool Slate)
- **Danger**: `#F43F5E` (Tomato)
- **Text**: `#FFFFFF` (White)
- **Text Secondary**: `#E6EEF8` (Near-white)

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- 2xl: 24px

### Shadows
- Soft: `0 6px 18px rgba(2,6,23,0.7)`
- Medium: `0 10px 30px rgba(2,6,23,0.8)`

### Typography
- Font Family: Inter, sans-serif
- Font Sizes: 12px (xs) to 32px (3xl)

## Using the Wireframes

### Importing to Figma
1. Use a Figma plugin that can import JSON wireframes
2. Or manually recreate using the specifications provided

### Implementation Notes
- All components should be responsive (mobile-first)
- Use the exact color values for consistency
- Maintain 4.5:1 contrast ratio for accessibility
- All interactive elements should have focus states
- Use skeleton loaders for async data

## Key UX Patterns

### Forms
- Inline validation with error messages
- Required fields marked with asterisk
- Helper text for complex fields
- Submit buttons disabled until form is valid

### Tables
- Sortable columns
- Pagination for large datasets
- Row actions (Edit, Delete, View History)
- Empty states with helpful CTAs

### Modals
- Backdrop overlay with blur
- Close button (X) in top-right
- Cancel and Confirm buttons
- Escape key to close

### Notifications
- Toast notifications for success/error
- In-app banner for important alerts
- Desktop notifications for low stock

## Accessibility Requirements

- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- High-contrast focus indicators
- Skip links for main content
- Alt text for all images

## Mobile Responsive

- Collapsible sidebar (hamburger menu)
- Bottom sticky action buttons
- Condensed table views
- Full-width modals on mobile
- Touch-friendly button sizes (min 44x44px)

