## Goal
Apnar upload kora `Doo_Prime_rebranded_as_D_Prime_in_2025.json` file ta database e import korte hobe — slug: `doo-prime-d-prime`.

## Steps
1. Apni `/admin/import-json` page e jaben.
2. **Entity Type**: `Broker` select korben.
3. **Existing broker mode**: `Smart merge (recommended)` — eta default e ase, kichu change korte hobe na.
4. JSON file er content ta copy kore textarea e paste korben.
5. **Validate & Preview** click korben → green "Valid" badge dekhle thik ase.
6. **Insert as Draft** (ba **Insert All Valid**) click korben.

## What happens
- Slug `doo-prime-d-prime` database e na thakle notun draft broker create hobe.
- Thakle smart-merge hobe — `long_review` fully replace hobe (v4.7 content), baki top-level fields shudhu empty hole overwrite hobe.
- Importer already auto-flatten kore, tai nested `long_review` issue hobe na.
- Insert hoyar por `/admin/brokers` theke draft → published korte hobe homepage e dekhanor jonno.

## No code changes needed
Importer, validator, flatten logic — shob ready. Eta shudhu ekta data import action, tai kono file edit lagbe na.
