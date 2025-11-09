import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { richSnippetsSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

export const getRichSnippetsSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await db
      .select()
      .from(richSnippetsSettings)
      .limit(1);

    // If no settings exist, create default
    if (settings.length === 0) {
      const [newSettings] = await db
        .insert(richSnippetsSettings)
        .values({
          organizationEnabled: true,
          organizationName: '',
          organizationLogo: '',
          organizationType: 'OnlineStore',
          telephone: '',
          email: '',
          addressStreet: '',
          addressCity: '',
          addressPostalCode: '',
          addressCountry: 'BG',
          socialFacebook: '',
          socialInstagram: '',
          socialTwitter: '',
          productSnippetsEnabled: true,
          productDescriptionType: 'short',
          productIncludeSpecifications: true,
          productIncludePrice: true,
          productIncludeAvailability: true,
          productIncludeSku: true,
          productIncludeImages: true,
          productIncludeBrand: true,
          defaultCurrency: 'BGN',
          breadcrumbsEnabled: true,
          websiteSearchEnabled: true,
          searchUrlPattern: '/search?q={search_term_string}',
          blogSnippetsEnabled: true,
          defaultAuthorName: '',
          defaultAuthorImage: ''
        })
        .returning();

      return res.json({ data: newSettings });
    }

    res.json({ data: settings[0] });
  } catch (error) {
    next(error);
  }
};

export const updateRichSnippetsSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await db.select().from(richSnippetsSettings).limit(1);

    if (settings.length === 0) {
      return res.status(404).json({ message: 'Rich Snippets settings not found' });
    }

    const [updatedSettings] = await db
      .update(richSnippetsSettings)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(richSnippetsSettings.id, settings[0].id))
      .returning();

    logger.info(`Updated Rich Snippets settings`);

    res.json({ data: updatedSettings });
  } catch (error) {
    next(error);
  }
};
