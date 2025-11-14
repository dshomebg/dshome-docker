import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { productQuestions, productAnswers, productQaSettings, products, emailTemplates } from '../db/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get questions for a specific product with answers
export const getProductQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get approved questions
    const questionsList = await db.select()
      .from(productQuestions)
      .where(and(
        eq(productQuestions.productId, productId),
        eq(productQuestions.status, 'approved')
      ))
      .orderBy(desc(productQuestions.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get answers for each question
    const questionsWithAnswers = await Promise.all(
      questionsList.map(async (question) => {
        const answers = await db.select()
          .from(productAnswers)
          .where(and(
            eq(productAnswers.questionId, question.id),
            eq(productAnswers.status, 'approved')
          ))
          .orderBy(desc(productAnswers.isStoreOfficial), desc(productAnswers.createdAt)); // Store answers first

        return {
          ...question,
          answers
        };
      })
    );

    // Get total count
    const [countResult] = await db.select({ count: count() })
      .from(productQuestions)
      .where(and(
        eq(productQuestions.productId, productId),
        eq(productQuestions.status, 'approved')
      ));

    const totalCount = Number(countResult?.count || 0);

    logger.info(`Fetched ${questionsList.length} questions for product ${productId}`);

    res.json({
      data: questionsWithAnswers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Ask a question (customer or guest)
export const askQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      productId,
      customerId,
      questionText,
      askerName,
      askerEmail
    } = req.body;

    // Validation
    if (!questionText || questionText.length < 10) {
      throw new AppError(400, 'Question must be at least 10 characters', 'QUESTION_TOO_SHORT');
    }

    if (!askerEmail || !askerEmail.includes('@')) {
      throw new AppError(400, 'Valid email is required for notifications', 'INVALID_EMAIL');
    }

    // Check if product exists
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Get moderation settings
    const [settings] = await db.select().from(productQaSettings).limit(1);
    const autoApprove = settings?.autoApproveQuestions || false;

    const [newQuestion] = await db.insert(productQuestions).values({
      productId,
      customerId: customerId || null,
      questionText,
      askerName,
      askerEmail,
      status: autoApprove ? 'approved' : 'pending'
    }).returning();

    logger.info(`New question asked for product ${productId}`);

    res.status(201).json({
      success: true,
      data: newQuestion,
      message: autoApprove
        ? 'Question submitted successfully'
        : 'Question submitted and awaiting approval'
    });
  } catch (error) {
    next(error);
  }
};

// Add answer to a question
export const addAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questionId } = req.params;
    const {
      customerId,
      answerText,
      answererName,
      answererEmail,
      isStoreOfficial
    } = req.body;

    // Validation
    if (!answerText || answerText.length < 10) {
      throw new AppError(400, 'Answer must be at least 10 characters', 'ANSWER_TOO_SHORT');
    }

    // Check if question exists
    const [question] = await db.select().from(productQuestions).where(eq(productQuestions.id, questionId)).limit(1);
    if (!question) {
      throw new AppError(404, 'Question not found', 'QUESTION_NOT_FOUND');
    }

    // Store official answers are auto-approved, customer answers need approval
    const status = isStoreOfficial ? 'approved' : 'pending';

    const [newAnswer] = await db.insert(productAnswers).values({
      questionId,
      customerId: customerId || null,
      answerText,
      answererName,
      answererEmail: answererEmail || null,
      isStoreOfficial: isStoreOfficial || false,
      status
    }).returning();

    // If store official answer, send email notification to asker
    if (isStoreOfficial) {
      // TODO: Send email notification
      logger.info(`Email notification should be sent to ${question.askerEmail}`);
    }

    logger.info(`Answer added to question ${questionId}`);

    res.status(201).json({
      success: true,
      data: newAnswer,
      message: isStoreOfficial
        ? 'Answer added successfully'
        : 'Answer submitted and awaiting approval'
    });
  } catch (error) {
    next(error);
  }
};

// Approve question (admin)
export const approveQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [question] = await db.update(productQuestions)
      .set({
        status: 'approved',
        updatedAt: new Date()
      })
      .where(eq(productQuestions.id, id))
      .returning();

    if (!question) {
      throw new AppError(404, 'Question not found', 'QUESTION_NOT_FOUND');
    }

    logger.info(`Question ${id} approved`);

    res.json({
      success: true,
      data: question,
      message: 'Question approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Approve answer (admin)
export const approveAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [answer] = await db.update(productAnswers)
      .set({
        status: 'approved',
        updatedAt: new Date()
      })
      .where(eq(productAnswers.id, id))
      .returning();

    if (!answer) {
      throw new AppError(404, 'Answer not found', 'ANSWER_NOT_FOUND');
    }

    // Get question to send notification
    const [question] = await db.select()
      .from(productQuestions)
      .where(eq(productQuestions.id, answer.questionId))
      .limit(1);

    if (question) {
      // TODO: Send email notification to asker
      logger.info(`Email notification should be sent to ${question.askerEmail}`);
    }

    logger.info(`Answer ${id} approved`);

    res.json({
      success: true,
      data: answer,
      message: 'Answer approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete question (admin)
export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [deletedQuestion] = await db.delete(productQuestions)
      .where(eq(productQuestions.id, id))
      .returning();

    if (!deletedQuestion) {
      throw new AppError(404, 'Question not found', 'QUESTION_NOT_FOUND');
    }

    logger.info(`Question ${id} deleted`);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete answer (admin)
export const deleteAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [deletedAnswer] = await db.delete(productAnswers)
      .where(eq(productAnswers.id, id))
      .returning();

    if (!deletedAnswer) {
      throw new AppError(404, 'Answer not found', 'ANSWER_NOT_FOUND');
    }

    logger.info(`Answer ${id} deleted`);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get single question with answers (admin)
export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [result] = await db.select({
      question: productQuestions,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug
      }
    })
    .from(productQuestions)
    .leftJoin(products, eq(productQuestions.productId, products.id))
    .where(eq(productQuestions.id, id))
    .limit(1);

    if (!result) {
      throw new AppError(404, 'Question not found', 'QUESTION_NOT_FOUND');
    }

    // Get answers for the question
    const answers = await db.select()
      .from(productAnswers)
      .where(eq(productAnswers.questionId, id))
      .orderBy(desc(productAnswers.isStoreOfficial), desc(productAnswers.createdAt));

    logger.info(`Fetched question ${id} with ${answers.length} answers`);

    res.json({
      data: {
        ...result,
        answers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all questions (admin) with filtering
export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      productId,
      withoutAnswers
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(productQuestions.status, status as any));
    }
    if (productId) {
      conditions.push(eq(productQuestions.productId, productId as string));
    }

    let query = db.select({
      question: productQuestions,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug
      }
    })
    .from(productQuestions)
    .leftJoin(products, eq(productQuestions.productId, products.id));

    let countQuery = db.select({ count: count() }).from(productQuestions);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    let questionsList = await query.orderBy(desc(productQuestions.createdAt)).limit(limitNum).offset(offset);

    // Get answers for each question
    const questionsWithAnswers = await Promise.all(
      questionsList.map(async (item) => {
        const answers = await db.select()
          .from(productAnswers)
          .where(eq(productAnswers.questionId, item.question.id))
          .orderBy(desc(productAnswers.isStoreOfficial), desc(productAnswers.createdAt));

        return {
          ...item,
          answers
        };
      })
    );

    // Filter by "without answers" if requested
    let finalList = questionsWithAnswers;
    if (withoutAnswers === 'true') {
      finalList = questionsWithAnswers.filter(item => item.answers.length === 0);
    }

    const [countResult] = await countQuery;
    const totalCount = Number(countResult?.count || 0);

    logger.info(`Fetched ${finalList.length} questions for admin`);

    res.json({
      data: finalList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Q&A settings
export const getQaSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let [settings] = await db.select().from(productQaSettings).limit(1);

    // If no settings exist, create default
    if (!settings) {
      [settings] = await db.insert(productQaSettings).values({
        autoApproveQuestions: false,
        autoApproveCustomerAnswers: false,
        emailTemplateId: null
      }).returning();
    }

    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
};

// Update Q&A settings
export const updateQaSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { autoApproveQuestions, autoApproveCustomerAnswers, emailTemplateId } = req.body;

    let [existingSettings] = await db.select().from(productQaSettings).limit(1);

    if (!existingSettings) {
      // Create if doesn't exist
      [existingSettings] = await db.insert(productQaSettings).values({
        autoApproveQuestions: autoApproveQuestions || false,
        autoApproveCustomerAnswers: autoApproveCustomerAnswers || false,
        emailTemplateId: emailTemplateId || null
      }).returning();
    } else {
      // Update existing
      [existingSettings] = await db.update(productQaSettings)
        .set({
          autoApproveQuestions,
          autoApproveCustomerAnswers,
          emailTemplateId,
          updatedAt: new Date()
        })
        .where(eq(productQaSettings.id, existingSettings.id))
        .returning();
    }

    logger.info('Q&A settings updated');

    res.json({
      success: true,
      data: existingSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
