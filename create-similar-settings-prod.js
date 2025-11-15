import postgres from 'postgres';

const sql = postgres({
  host: 'postgres',
  port: 5432,
  database: 'dshome_prod',
  username: 'dshome',
  password: 'dshome123'
});

async function createTable() {
  try {
    console.log('Creating similar_products_settings table...');

    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS similar_products_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

        -- Global Settings
        module_enabled boolean DEFAULT true NOT NULL,
        default_limit integer DEFAULT 12 NOT NULL,
        cache_duration integer DEFAULT 900 NOT NULL,
        exclude_out_of_stock boolean DEFAULT true NOT NULL,

        -- Same Category
        same_category_enabled boolean DEFAULT true NOT NULL,
        same_category_limit integer DEFAULT 8 NOT NULL,
        same_category_title varchar(255) DEFAULT 'Продукти от същата категория' NOT NULL,
        same_category_sort varchar(50) DEFAULT 'popularity' NOT NULL,
        same_category_match_type varchar(50) DEFAULT 'primary' NOT NULL,
        same_category_show_image boolean DEFAULT true NOT NULL,
        same_category_show_price boolean DEFAULT true NOT NULL,
        same_category_show_add_to_cart boolean DEFAULT true NOT NULL,

        -- Similar Features
        similar_features_enabled boolean DEFAULT true NOT NULL,
        similar_features_limit integer DEFAULT 6 NOT NULL,
        similar_features_title varchar(255) DEFAULT 'Продукти с подобни характеристики' NOT NULL,
        similar_features_min_similarity integer DEFAULT 30 NOT NULL,
        similar_features_show_score boolean DEFAULT false NOT NULL,
        similar_features_fallback varchar(50) DEFAULT 'same_category' NOT NULL,
        similar_features_combine_with_same_category boolean DEFAULT true NOT NULL,
        similar_features_show_image boolean DEFAULT true NOT NULL,
        similar_features_show_price boolean DEFAULT true NOT NULL,
        similar_features_show_add_to_cart boolean DEFAULT true NOT NULL,

        -- Related Products
        related_enabled boolean DEFAULT false NOT NULL,
        related_limit integer DEFAULT 4 NOT NULL,
        related_title varchar(255) DEFAULT 'Свързани продукти' NOT NULL,
        related_bidirectional boolean DEFAULT true NOT NULL,
        related_priority varchar(50) DEFAULT 'medium' NOT NULL,
        related_show_image boolean DEFAULT true NOT NULL,
        related_show_price boolean DEFAULT true NOT NULL,
        related_show_add_to_cart boolean DEFAULT true NOT NULL,

        -- Display Settings
        layout_type varchar(50) DEFAULT 'grid' NOT NULL,
        grid_columns integer DEFAULT 4 NOT NULL,
        card_style varchar(50) DEFAULT 'standard' NOT NULL,
        show_section_dividers boolean DEFAULT true NOT NULL,
        animation varchar(50) DEFAULT 'fade' NOT NULL,
        mobile_layout varchar(50) DEFAULT 'carousel' NOT NULL,

        -- Advanced
        excluded_category_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
        excluded_product_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
        max_candidates integer DEFAULT 100 NOT NULL,
        enable_query_caching boolean DEFAULT true NOT NULL,
        module_order jsonb DEFAULT '["same_category", "similar_features", "related"]'::jsonb NOT NULL,

        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    console.log('Table created successfully!');

    // Insert default settings row
    console.log('Inserting default settings...');
    await sql`
      INSERT INTO similar_products_settings (id)
      SELECT gen_random_uuid()
      WHERE NOT EXISTS (SELECT 1 FROM similar_products_settings)
    `;

    console.log('Default settings inserted!');

    // Verify
    const [settings] = await sql`SELECT * FROM similar_products_settings LIMIT 1`;
    console.log('Settings row:', settings);

    await sql.end();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
    process.exit(1);
  }
}

createTable();
