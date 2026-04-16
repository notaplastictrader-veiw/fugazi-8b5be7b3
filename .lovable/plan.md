

# Advertise Page — Pricing & Budget Remove, Contact-First Flow

## Changes

### `src/pages/Advertise.tsx`
1. **Placement cards থেকে `price` field সরাও** — শুধু title + description থাকবে, pricing দেখাবে না
2. **Budget dropdown সম্পূর্ণ সরাও** — Select component ও `budgetRanges` array remove
3. **Form description update**: "Fill out the form and our team will schedule a meeting and share our media kit." 
4. **Success toast update**: "Enquiry submitted! We'll schedule a meeting and share our media kit within 24 hours."
5. **`budget` state ও related import (`Select`, `SelectContent`, etc.) cleanup**

### `src/components/sections/BrokerJoinSection.tsx`
- কোনো pricing নেই এখানে, তাই change নেই

### Summary
- 1 file edit: `src/pages/Advertise.tsx`
- Pricing/budget references সব remove
- Messaging update: contact → meeting → media kit

