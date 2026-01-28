# Admin Quick Start Guide

> **Get NZC EasyAudit up and running in 15 minutes**

This quick start guide provides the essential steps to deploy and configure NZC EasyAudit in your Salesforce org.

---

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ **Salesforce Net Zero Cloud** licensed and active
- ✅ **System Administrator** access or equivalent permissions
- ✅ **Deployment permissions** in your Salesforce org
- ✅ **Test records** available (Vehicle or Stationary Energy Use records)

---

## Step 1: Deploy the Component

Choose your deployment method:

### Option A: One-Click Deploy (Recommended)

1. Click the **"Deploy to Salesforce"** button on the [main README](../README.md)
2. Authenticate with your Salesforce org
3. Select your target org
4. Click **Deploy**

### Option B: Salesforce CLI

```bash
# Clone the repository
git clone https://github.com/jvillalpando_sfemu/NZC-EasyAudit.git
cd NZC-EasyAudit

# Authenticate to your org
sf org login web --alias MyOrg

# Deploy
sf project deploy start --source-dir force-app --target-org MyOrg
```

### Option C: Workbench

1. Download the deployment package
2. Go to [Salesforce Workbench](https://workbench.developerforce.com)
3. Navigate to **Migration** → **Deploy**
4. Upload and deploy the package

---

## Step 2: Configure Security

### Quick Setup with Permission Set

1. Navigate to **Setup** → **Permission Sets**
2. Open **NZC EasyAudit Access** (included in deployment)
3. Click **Object Settings**
4. Enable **Read** access for:
   - Vehicle Asset Energy Use
   - Stationary Asset Energy Use
   - Other Emission Factor Set Item
   - Other Emission Factor Set
   - Electricity Emission Factor Set
   - Refrigerant Emission Factor
   - Sustainability UOM Conversion
   - Fuel Type
   - Sustainability UOM
   - Vehicle Asset Emission Source
   - Stationary Asset Environment Source
   - Other Emission Factor

5. For each object, enable **Read** access for all fields (or use **View All** if available)

6. Click **Manage Assignments** → **Add Assignments**
7. Select users who need access
8. Click **Assign**

> **Note:** Apex class access is already configured in the permission set. You only need to add object/field permissions.

---

## Step 3: Add Component to Lightning Pages

### For Vehicle Energy Use Records

1. Navigate to **Setup** → **Lightning App Builder**
2. Find and edit the **Vehicle Energy Use** record page
3. In the component palette, find **NZC_EasyAuditShell** under **Custom Components**
4. Drag the component to your desired location
5. Click **Save** → **Activate**

### For Stationary Energy Use Records

1. Navigate to **Setup** → **Lightning App Builder**
2. Find and edit the **Stationary Energy Use** record page
3. Add **NZC_EasyAuditShell** component
4. Click **Save** → **Activate**

---

## Step 4: Test the Component

1. Navigate to a **Vehicle Energy Use** or **Stationary Energy Use** record
2. Verify the **NZC EasyAudit** component appears on the page
3. Expand the accordion sections to view calculation steps
4. Verify calculations display correctly

---

## Troubleshooting

### Component Not Visible?

- ✅ Verify the component was added to the Lightning page
- ✅ Verify the page is activated
- ✅ Check that the user has the permission set assigned
- ✅ Verify object and field permissions are configured

### "Insufficient Privileges" Error?

- ✅ Verify permission set includes all required objects
- ✅ Verify field-level security is enabled
- ✅ Check that Apex class access is granted

### Calculations Not Displaying?

- ✅ Verify emission factor records exist
- ✅ Check that related records are properly linked
- ✅ Review browser console for errors

---

## Next Steps

- 📖 Read the [Complete Admin Setup Guide](admin-setup.md) for detailed configuration
- 🔧 Review [Configuration Options](admin-configuration.md) for advanced settings
- 🐛 Check [Troubleshooting Guide](admin-troubleshooting.md) for common issues
- 👥 Share the [User Guide](user-guide.md) with your end users

---

## Quick Reference

| Task | Location |
|------|----------|
| Deploy Component | [README.md](../README.md#-getting-started) |
| Configure Security | [Admin Setup Guide](admin-setup.md#security-configuration) |
| Add to Pages | [Admin Setup Guide](admin-setup.md#lightning-page-configuration) |
| Troubleshoot Issues | [Troubleshooting Guide](admin-troubleshooting.md) |

---

**Need Help?** Check the [Complete Admin Setup Guide](admin-setup.md) or [open an issue](https://github.com/jvillalpando_sfemu/NZC-EasyAudit/issues) on GitHub.
