import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import Category from '@/modules/content/entities/category.entity';

export const categoriesSeeds = [
  { name: 'التقنية والذكاء الاصطناعي', slug: 'technology-ai', color: '#3B82F6' },
  { name: 'ريادة الأعمال', slug: 'entrepreneurship', color: '#10B981' },
  { name: 'التصميم والإبداع', slug: 'design-creativity', color: '#8B5CF6' },
  { name: 'التسويق الرقمي', slug: 'digital-marketing', color: '#F59E0B' },
  { name: 'التطوير الشخصي', slug: 'personal-development', color: '#EF4444' },
  { name: 'الثقافة والمجتمع', slug: 'culture-society', color: '#06B6D4' },
  { name: 'العلوم والطب', slug: 'science-medicine', color: '#84CC16' },
  { name: 'التاريخ والحضارة', slug: 'history-civilization', color: '#F97316' }
];

export class CategorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌱 Seeding categories...');

    const existingCategories = await em.find(Category, {});
    const existingCategorySlugs = new Set(existingCategories.map((c) => c.slug));
    console.log(`🔍 Found ${existingCategorySlugs.size} existing categories in the database.`);

    const categoriesToCreate: Category[] = [];

    for (const categoryData of categoriesSeeds) {
      if (!existingCategorySlugs.has(categoryData.slug)) {
        const category = new Category();
        category.name = categoryData.name;
        category.slug = categoryData.slug;
        category.color = categoryData.color;
        categoriesToCreate.push(category);
      }
    }

    if (categoriesToCreate.length > 0) {
      console.log(`➕ Creating ${categoriesToCreate.length} new categories...`);
      await em.persistAndFlush(categoriesToCreate);
    } else {
      console.log('✅ All categories are already up-to-date.');
    }

    console.log('Categories seeding complete.');
  }
}

export default CategorySeeder;
