# Zvonder

Act as an expert full-stack developer. Build a complete, mobile-responsive e-commerce application for "سوبر ماركت خير زمان" (Managed by: سامح الليثي).



Tech Stack: React, Tailwind CSS, Shadcn UI, and Supabase (Auth, Database, Storage).



Core Features & Requirements:



1. General App Settings:

- Name: سوبر ماركت خير زمان.

- Footer/Contact Info: 

  - Phone/WhatsApp: 01278110854

  - Facebook: https://www.facebook.com/khyr.zman.288094

  - Maps: https://maps.app.goo.gl/ZL1hHbPzfMsTiziEA?g_st=ac

  - Vodafone Cash: 01070873294

- Design: Modern, clean, support Dark Mode, mobile-first.



2. Admin Dashboard (Crucial - Full CRUD):

- Create a route "/admin" protected by simple Auth.

- Product Management (CRUD):

  - "Add New Product" Button: Triggers a form/modal with fields for: Product Name, Price, Description, and Image Upload (upload image to Supabase Storage, save URL to DB).

  - "Edit Product" Feature: Allow modifying the Price, Name, and Image for existing products directly from the UI.

  - "Delete Product" Button: For removing items.

- All actions (Add/Edit/Delete) must instantly update the Supabase 'products' table.



3. User Interface:

- Product Catalog: Display items with images, names, and dynamic prices.

- Dark Mode toggle in the header.



4. Shopping Cart & Checkout (Workflow):

- Cart functionality with real-time total calculation.

- Checkout Form: Collect user Name, Phone, and Address.

- Payment Methods:

  a) "Vodafone Cash": Button triggers tel: URI: tel:*9*7*01070873294*[TOTAL_AMOUNT]#

  b) Receipt Upload: File input for payment screenshot.

- "Confirm Order" Logic:

  1. Save order to Supabase 'orders' table (status: 'pending').

  2. Automatically trigger a WhatsApp deep link (wa.me/201278110854).

  3. The message must be URL-encoded and include:

     - Header: "طلب جديد من سوبر ماركت خير زمان"

     - Customer Details (Name, Phone, Address).

     - Full Order List (Items & Quantities).

     - Total Amount.

     - Closing: "يرجى إرسال الموقع (Location) لتأكيد الطلب وبدء التوصيل."



5. Database Schema:

- 'products' table (id, name, price, image_url, description).

- 'orders' table (id, customer_name, phone, address, total_amount, status, receipt_url, created_at).

- Enable RLS for security.



6. Chatbot Integration:

- Add a placeholder component for an external chatbot script.



Please implement with clean, modular code. The dynamic WhatsApp checkout flow and the Admin CRUD functionality are the highest priority.ضيفلي انو اقدر اعمل حساب زبون وضيفلي شوية منتاجت وزر الواتس والفيس والموقع مش شغالية ليه 

Act as an expert full-stack developer. Build a complete, mobile-responsive e-commerce application using React, Tailwind CSS, Shadcn UI, and Supabase for backend (Auth, Database, and Storage).



​Core Requirements:



​Database Architecture: Create tables for products, orders, and order_items.



​User Flow:



​Implement secure User Authentication (Signup/Login/Logout).



​Display a responsive product catalog.



​Shopping Cart functionality with dynamic total calculation.



​Checkout & Payment (Vodafone Cash):



​Add a "Vodafone Cash" payment method in the checkout step.



​Generate a button that triggers a tel: URI scheme to open the mobile dialer: tel:*9*7*010xxxxxxxx*TOTAL# (where TOTAL is the cart's dynamic total).



​Add a file upload input field for users to upload a screenshot of their payment receipt.



​Store the order data and the receipt image URL in the orders table with a status of 'pending'.



​Admin Interface: A simple dashboard for viewing orders and checking the uploaded payment receipts.



​Chatbot Integration: Add a placeholder component for an external chatbot script in the main layout.



​Design: Use a modern, clean UI, optimized for mobile devices. Ensure all database relations are set up correctl

تمام 







اضف هذه التعديلات







اسم السوبر ماركت خير زمان







اضف الدارك مود







اضف الموقع https://maps.app.goo.gl/ZL1hHbPzfMsTiziEA?g_st=ac







وصفحة الفيسبوك 







https://www.facebook.com/khyr.zman.288094







اضف رقم الاتصال 







01278110854







والواتس نفس الرقم 







ورقم فودافون كاش







01070873294





 اكبتلي السوبر ماركت ادارة سامح الليثي 

من فضلك قم بتعديل رسالة الواتساب 



واكتب نيابة عن الزبون 



رسالة ترحيب وارسال الموقع لرقمي لكي اقوم بارسال الطلب الخاص بالزبون علي الموقعوحساب الادمن ا البريد بتاع amrfathylithy2030@gmail.com 

وضيفلي تم التصميم byبشمهندس عمرو بن فتحي الليثيالغي خاصية التحقق من الاميللحساب الزبونمفيش لوحة تحكم للادمن يعني زي م اتفقنا انو يبقي فيه لوحة تحكم للادمن ال هو الاميل دا amrfathylithy2030@gmail.com 

واقدر احدث اسعار المنتجات واضيف منتجات جديدة وحذاف منتجاتاكتبلي رسالة ترحيب لما بيدخل علي الواتس  وخليه اجباري انو يحط ايشال الدفع ونو يدفع الأول قبل اتمام الطلب

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://zavendor.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/991c784d-3b5c-43a4-a220-4a622c000c24).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
