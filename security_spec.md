# Security Specification

## 1. Data Invariants
- **User profiles** can only be accessed/modified by the authenticated user matching their `userId`.
- **Campaign orders** can only be written by authenticated users who are verified.
- Non-admin users can only list and read orders where the order `customerEmail` matches their auth email token.
- Only administrators (listed in the admins list, or by checked verified handle `uylusjohnson@gmail.com`) can read all orders, update status fields, or perform full backstage operations.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Identity Spoofing on User Profile**: Attempting to write a profile to another user's path.
2. **Access Escalation on User Profile**: Attempting to grant oneself the "admin" role.
3. **Orphaned Order Creation**: Attempting to create an order as an unauthenticated guest.
4. **Email Poisoning on Order**: Attempting to create an order under a customer email that does not match the logged-in user's email.
5. **Junk ID Injection**: Creating an order with a massive 2MB ID string.
6. **Negative Price Exploit**: Creating an order with `paidAmount: -500` to drain funds.
7. **Bypass State Machine**: Attempting to update a campaign status from 'Processing' directly to 'Completed' as a regular user.
8. **Admin Key Hijacking**: Trying to overwrite the profit calculations or internal supplier metrics as a basic customer.
9. **Blanket Order Scraping**: Attempting to list all orders in the system without filtering by the personal email handle.
10. **Supplier Details Tampering**: Regular users attempting to edit `supplierStatus` in their active campaigns.
11. **Shadow Field Poisoning**: Inserting extra unauthorized fields (e.g., `isSuperAdmin: true`) on creation.
12. **Timestamp Forgery**: Forging a backward or future `date` instead of using the proper request time.

## 3. Rules Implementation and Hardening
We will put the secure constraints in `firestore.rules` and verify them under strict access control guidelines.
