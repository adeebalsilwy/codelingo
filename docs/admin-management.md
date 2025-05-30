# Admin Management Documentation
# توثيق إدارة المسؤولين

## Introduction | مقدمة

This document covers the administration features of the Lingo application, including how to add, remove, and manage admin users who have special privileges within the system.

يغطي هذا المستند ميزات الإدارة في تطبيق لينغو، بما في ذلك كيفية إضافة وإزالة وإدارة المستخدمين المسؤولين الذين يتمتعون بامتيازات خاصة داخل النظام.

## Admin Privileges | امتيازات المسؤول

Admins have the following capabilities:
- Access to the admin dashboard
- Ability to manage courses and content
- Management of user accounts
- System configuration options

يتمتع المسؤولون بالقدرات التالية:
- الوصول إلى لوحة تحكم المسؤول
- القدرة على إدارة الدورات والمحتوى
- إدارة حسابات المستخدمين
- خيارات تكوين النظام

## Command Line Admin Management Tools | أدوات إدارة المسؤول من سطر الأوامر

Our system provides several command-line scripts to help manage admin accounts:

### 1. Adding an Admin | إضافة مسؤول

```bash
# Format
npx tsx scripts/add-admin.ts <user_id>

# Example
npx tsx scripts/add-admin.ts user_2RmFCQx8ZQeVJHQIJ1OuPAElv52
```

The user ID should be the Clerk user ID of the user you want to promote to admin status.

### 2. Listing All Admins | عرض جميع المسؤولين

```bash
# Format
npx tsx scripts/list-admins.ts

# Example
npx tsx scripts/list-admins.ts
```

This will display a table of all admin users in the system, including their IDs and creation dates.

### 3. Removing an Admin | إزالة مسؤول

```bash
# Format
npx tsx scripts/remove-admin.ts <user_id>

# Example
npx tsx scripts/remove-admin.ts user_2RmFCQx8ZQeVJHQIJ1OuPAElv52
```

This will remove admin privileges from the specified user.

## Web Interface Admin Management | إدارة المسؤول من واجهة الويب

If you already have admin privileges, you can add or remove other admins through the web interface:

### Adding an Admin Through Web Interface | إضافة مسؤول من خلال واجهة الويب

1. Log in to your admin account
2. Navigate to the Admin Dashboard
3. Select "User Management" 
4. Find the user you want to promote
5. Click "Make Admin" button

### Removing an Admin Through Web Interface | إزالة مسؤول من خلال واجهة الويب

1. Access the Admin Dashboard
2. Navigate to "User Management"
3. Find the admin user
4. Click "Remove Admin Status"

## Security Best Practices | أفضل ممارسات الأمان

- Only grant admin privileges to trusted users
- Regularly audit the admin user list
- Remove admin privileges immediately when no longer needed
- Use strong passwords for admin accounts
- Enable two-factor authentication for all admin accounts

- امنح امتيازات المسؤول للمستخدمين الموثوق بهم فقط
- قم بمراجعة قائمة المستخدمين المسؤولين بانتظام
- قم بإزالة امتيازات المسؤول فورًا عندما لا تكون هناك حاجة إليها
- استخدم كلمات مرور قوية لحسابات المسؤول
- قم بتمكين المصادقة الثنائية لجميع حسابات المسؤول

## Troubleshooting | استكشاف الأخطاء وإصلاحها

### Common Issues | المشكلات الشائعة

1. **Admin privileges not taking effect immediately**
   - Solution: Ask the user to log out and log back in

2. **Cannot add an admin**
   - Solution: Verify that the user ID is correct and that the user exists in the system

3. **Admin dashboard not accessible**
   - Solution: Check database connectivity and ensure the admins table is properly configured

1. **امتيازات المسؤول لا تصبح سارية على الفور**
   - الحل: اطلب من المستخدم تسجيل الخروج ثم تسجيل الدخول مرة أخرى

2. **لا يمكن إضافة مسؤول**
   - الحل: تحقق من صحة معرف المستخدم ومن وجود المستخدم في النظام

3. **لوحة تحكم المسؤول غير قابلة للوصول**
   - الحل: تحقق من اتصال قاعدة البيانات وتأكد من تكوين جدول المسؤولين بشكل صحيح

## Technical Implementation | التنفيذ التقني

The admin system is implemented with:
- Database table: `admins` (with fields: id, userId, createdAt, updatedAt)  
- API routes for admin management
- Middleware for checking admin permissions
- Frontend components for the admin dashboard

تم تنفيذ نظام المسؤول باستخدام:
- جدول قاعدة البيانات: `admins` (مع الحقول: id، userId، createdAt، updatedAt)
- مسارات API لإدارة المسؤول
- برامج وسيطة للتحقق من أذونات المسؤول
- مكونات واجهة المستخدم للوحة تحكم المسؤول 