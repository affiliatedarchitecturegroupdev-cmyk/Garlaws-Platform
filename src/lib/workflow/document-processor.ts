// Intelligent Document Processing Engine

export interface DocumentField {
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'list';
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
  aiPrompt?: string; // Custom prompt for AI extraction
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'receipt' | 'contract' | 'id_document' | 'bank_statement' | 'custom';
  fields: DocumentField[];
  aiModel: string;
  confidenceThreshold: number;
  preprocessing: {
    deskew: boolean;
    denoise: boolean;
    enhance: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentAnalysis {
  documentId: string;
  templateId: string;
  extractedData: Record<string, any>;
  confidence: number;
  fieldConfidences: Record<string, number>;
  processingTime: number;
  ocrText?: string;
  structuredData: Record<string, any>;
  validationErrors: Array<{
    field: string;
    error: string;
  }>;
  createdAt: Date;
}

export interface DocumentClassification {
  documentId: string;
  predictedType: string;
  confidence: number;
  alternatives: Array<{
    type: string;
    confidence: number;
  }>;
  features: Record<string, any>;
  processingTime: number;
  createdAt: Date;
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  language: string;
  processingTime: number;
}

export interface DocumentProcessingPipeline {
  id: string;
  name: string;
  steps: ProcessingStep[];
  inputFormats: string[];
  outputFormat: 'json' | 'xml' | 'csv';
  errorHandling: 'stop' | 'continue' | 'retry';
  createdAt: Date;
}

export interface ProcessingStep {
  id: string;
  type: 'ocr' | 'classification' | 'extraction' | 'validation' | 'transformation' | 'export';
  config: Record<string, any>;
  order: number;
  enabled: boolean;
}

class IntelligentDocumentProcessor {
  private templates: Map<string, DocumentTemplate> = new Map();
  private pipelines: Map<string, DocumentProcessingPipeline> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultPipelines();
  }

  private initializeDefaultTemplates() {
    // Invoice template
    const invoiceTemplate: DocumentTemplate = {
      id: 'invoice_template',
      name: 'Invoice Template',
      type: 'invoice',
      aiModel: 'gpt-4-vision',
      confidenceThreshold: 0.85,
      preprocessing: {
        deskew: true,
        denoise: true,
        enhance: true
      },
      fields: [
        {
          name: 'invoice_number',
          type: 'text',
          required: true,
          validation: { pattern: '^INV-\\d+$' },
          aiPrompt: 'Extract the invoice number, usually starting with INV-'
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          aiPrompt: 'Extract the invoice date in YYYY-MM-DD format'
        },
        {
          name: 'total_amount',
          type: 'currency',
          required: true,
          aiPrompt: 'Extract the total invoice amount including currency'
        },
        {
          name: 'vendor_name',
          type: 'text',
          required: true,
          aiPrompt: 'Extract the vendor or company name from the invoice'
        },
        {
          name: 'line_items',
          type: 'list',
          required: false,
          aiPrompt: 'Extract all line items with description, quantity, and price'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Receipt template
    const receiptTemplate: DocumentTemplate = {
      id: 'receipt_template',
      name: 'Receipt Template',
      type: 'receipt',
      aiModel: 'gpt-4-vision',
      confidenceThreshold: 0.80,
      preprocessing: {
        deskew: true,
        denoise: true,
        enhance: true
      },
      fields: [
        {
          name: 'merchant_name',
          type: 'text',
          required: true,
          aiPrompt: 'Extract the merchant or store name'
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          aiPrompt: 'Extract the transaction date'
        },
        {
          name: 'total',
          type: 'currency',
          required: true,
          aiPrompt: 'Extract the total amount paid'
        },
        {
          name: 'items',
          type: 'list',
          required: false,
          aiPrompt: 'Extract purchased items with descriptions and prices'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(invoiceTemplate.id, invoiceTemplate);
    this.templates.set(receiptTemplate.id, receiptTemplate);
  }

  private initializeDefaultPipelines() {
    // Standard document processing pipeline
    const standardPipeline: DocumentProcessingPipeline = {
      id: 'standard_processing',
      name: 'Standard Document Processing',
      steps: [
        {
          id: 'preprocessing',
          type: 'ocr',
          config: { enhance: true, deskew: true },
          order: 1,
          enabled: true
        },
        {
          id: 'classification',
          type: 'classification',
          config: { model: 'document_classifier_v1' },
          order: 2,
          enabled: true
        },
        {
          id: 'extraction',
          type: 'extraction',
          config: { use_ai: true, fallback_to_rules: true },
          order: 3,
          enabled: true
        },
        {
          id: 'validation',
          type: 'validation',
          config: { strict: false, auto_correct: true },
          order: 4,
          enabled: true
        },
        {
          id: 'export',
          type: 'export',
          config: { format: 'json', include_metadata: true },
          order: 5,
          enabled: true
        }
      ],
      inputFormats: ['pdf', 'png', 'jpg', 'jpeg', 'tiff'],
      outputFormat: 'json',
      errorHandling: 'continue',
      createdAt: new Date()
    };

    this.pipelines.set(standardPipeline.id, standardPipeline);
  }

  // Main processing method
  async processDocument(
    documentBuffer: ArrayBuffer,
    documentType: string,
    options: {
      templateId?: string;
      pipelineId?: string;
      customFields?: DocumentField[];
      callback?: (progress: number, status: string) => void;
    } = {}
  ): Promise<DocumentAnalysis> {
    const startTime = Date.now();
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    options.callback?.(0, 'Initializing processing...');

    try {
      // Step 1: Preprocessing
      options.callback?.(10, 'Preprocessing document...');
      const preprocessedImage = await this.preprocessDocument(documentBuffer, documentType);

      // Step 2: OCR
      options.callback?.(25, 'Performing OCR...');
      const ocrResult = await this.performOCR(preprocessedImage);

      // Step 3: Classification (if no template specified)
      options.callback?.(40, 'Classifying document...');
      const classification = options.templateId
        ? null
        : await this.classifyDocument(ocrResult.text, preprocessedImage);

      // Step 4: Template selection
      const templateId = options.templateId || classification?.predictedType || 'receipt_template';
      const template = this.templates.get(templateId);

      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Step 5: Data extraction
      options.callback?.(60, 'Extracting data...');
      const extractedData = await this.extractDocumentData(
        ocrResult,
        preprocessedImage,
        template,
        options.customFields
      );

      // Step 6: Validation
      options.callback?.(80, 'Validating extracted data...');
      const validation = this.validateExtractedData(extractedData, template.fields);

      // Step 7: Post-processing
      options.callback?.(95, 'Finalizing results...');
      const structuredData = this.structureExtractedData(extractedData, template.fields);

      const analysis: DocumentAnalysis = {
        documentId,
        templateId,
        extractedData,
        confidence: this.calculateOverallConfidence(extractedData.fieldConfidences),
        fieldConfidences: extractedData.fieldConfidences,
        processingTime: Date.now() - startTime,
        ocrText: ocrResult.text,
        structuredData,
        validationErrors: validation.errors,
        createdAt: new Date()
      };

      options.callback?.(100, 'Processing complete');
      return analysis;

    } catch (error) {
      options.callback?.(100, `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Preprocessing methods
  private async preprocessDocument(
    documentBuffer: ArrayBuffer,
    documentType: string
  ): Promise<ImageData> {
    // Simulate document preprocessing
    // In a real implementation, this would:
    // - Convert PDF to images
    // - Deskew images
    // - Remove noise
    // - Enhance contrast

    return new ImageData(800, 600); // Placeholder
  }

  // OCR processing
  private async performOCR(imageData: ImageData): Promise<OCRResult> {
    const startTime = Date.now();

    // Simulate OCR processing
    // In a real implementation, this would use Tesseract.js or Google Cloud Vision API

    const mockText = `
      INVOICE #INV-2024-001
      Date: 2024-04-20
      Vendor: TechCorp Solutions
      Total: R 2,450.00

      Item 1: Laptop Computer - R 2,000.00
      Item 2: Software License - R 450.00
    `;

    const boundingBoxes = [
      {
        text: 'INVOICE #INV-2024-001',
        x: 50, y: 50, width: 200, height: 20,
        confidence: 0.95
      },
      {
        text: 'Date: 2024-04-20',
        x: 50, y: 80, width: 150, height: 20,
        confidence: 0.92
      },
      {
        text: 'Total: R 2,450.00',
        x: 400, y: 200, width: 120, height: 20,
        confidence: 0.98
      }
    ];

    return {
      text: mockText,
      confidence: 0.94,
      boundingBoxes,
      language: 'en',
      processingTime: Date.now() - startTime
    };
  }

  // Document classification
  private async classifyDocument(
    text: string,
    imageData: ImageData
  ): Promise<DocumentClassification> {
    const startTime = Date.now();

    // Simulate document classification
    // In a real implementation, this would use a trained ML model

    const documentTypes = ['invoice', 'receipt', 'contract', 'bank_statement'];
    const predictions = documentTypes.map(type => ({
      type,
      confidence: Math.random()
    })).sort((a, b) => b.confidence - a.confidence);

    return {
      documentId: `temp_${Date.now()}`,
      predictedType: predictions[0].type,
      confidence: predictions[0].confidence,
      alternatives: predictions.slice(1),
      features: {
        hasInvoiceNumber: /invoice|inv/i.test(text),
        hasTotal: /total/i.test(text),
        hasDate: /\d{4}-\d{2}-\d{2}/.test(text)
      },
      processingTime: Date.now() - startTime,
      createdAt: new Date()
    };
  }

  // Data extraction using AI
  private async extractDocumentData(
    ocrResult: OCRResult,
    imageData: ImageData,
    template: DocumentTemplate,
    customFields?: DocumentField[]
  ): Promise<{
    data: Record<string, any>;
    fieldConfidences: Record<string, number>
  }> {
    const fields = customFields || template.fields;
    const extractedData: Record<string, any> = {};
    const fieldConfidences: Record<string, number> = {};

    // Process each field
    for (const field of fields) {
      try {
        const result = await this.extractFieldValue(
          field,
          ocrResult,
          imageData,
          template.aiModel
        );

        extractedData[field.name] = result.value;
        fieldConfidences[field.name] = result.confidence;

      } catch (error) {
        console.warn(`Failed to extract field ${field.name}:`, error);
        extractedData[field.name] = null;
        fieldConfidences[field.name] = 0;
      }
    }

    return { data: extractedData, fieldConfidences };
  }

  private async extractFieldValue(
    field: DocumentField,
    ocrResult: OCRResult,
    imageData: ImageData,
    aiModel: string
  ): Promise<{ value: any; confidence: number }> {
    // Simulate AI-powered field extraction
    // In a real implementation, this would:
    // 1. Use the field's aiPrompt to guide extraction
    // 2. Call an AI service (OpenAI GPT-4 Vision, Google Document AI, etc.)
    // 3. Parse and validate the response

    const mockExtractions: Record<string, { value: any; confidence: number }> = {
      invoice_number: { value: 'INV-2024-001', confidence: 0.95 },
      date: { value: '2024-04-20', confidence: 0.92 },
      total_amount: { value: 2450.00, confidence: 0.98 },
      vendor_name: { value: 'TechCorp Solutions', confidence: 0.89 },
      merchant_name: { value: 'TechCorp Solutions', confidence: 0.89 },
      total: { value: 2450.00, confidence: 0.98 }
    };

    return mockExtractions[field.name] || { value: null, confidence: 0.5 };
  }

  // Data validation
  private validateExtractedData(
    extractedData: Record<string, any>,
    fields: DocumentField[]
  ): { isValid: boolean; errors: Array<{ field: string; error: string }> } {
    const errors: Array<{ field: string; error: string }> = [];

    for (const field of fields) {
      const value = extractedData[field.name];

      // Required field validation
      if (field.required && (value === null || value === undefined || value === '')) {
        errors.push({
          field: field.name,
          error: `${field.name} is required but not found`
        });
        continue;
      }

      if (value === null || value === undefined) continue;

      // Type validation
      const typeValidation = this.validateFieldType(value, field.type);
      if (!typeValidation.valid) {
        errors.push({
          field: field.name,
          error: typeValidation.error || 'Invalid field type'
        });
        continue;
      }

      // Custom validation
      if (field.validation) {
        const customValidation = this.validateFieldRules(value, field.validation);
        if (!customValidation.valid) {
          errors.push({
            field: field.name,
            error: customValidation.error || 'Validation failed'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateFieldType(value: any, type: DocumentField['type']): { valid: boolean; error?: string } {
    switch (type) {
      case 'text':
        return { valid: typeof value === 'string' };
      case 'number':
        return { valid: typeof value === 'number' && !isNaN(value) };
      case 'date':
        return { valid: !isNaN(Date.parse(value)) };
      case 'currency':
        return { valid: typeof value === 'number' && value >= 0 };
      case 'boolean':
        return { valid: typeof value === 'boolean' };
      case 'list':
        return { valid: Array.isArray(value) };
      default:
        return { valid: true };
    }
  }

  private validateFieldRules(value: any, validation: NonNullable<DocumentField['validation']>): { valid: boolean; error?: string } {
    if (validation.pattern && typeof value === 'string') {
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return { valid: false, error: `Value does not match required pattern` };
        }
      }
    }

    if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
      return { valid: false, error: `Value must be at least ${validation.min}` };
    }

    if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
      return { valid: false, error: `Value must be at most ${validation.max}` };
    }

    if (validation.options && !validation.options.includes(value)) {
      return { valid: false, error: `Value must be one of: ${validation.options.join(', ')}` };
    }

    return { valid: true };
  }

  private structureExtractedData(
    extractedData: Record<string, any>,
    fields: DocumentField[]
  ): Record<string, any> {
    const structured: Record<string, any> = {};

    for (const field of fields) {
      const value = extractedData[field.name];

      // Apply any field-specific transformations
      structured[field.name] = this.transformFieldValue(value, field);
    }

    return structured;
  }

  private transformFieldValue(value: any, field: DocumentField): any {
    if (value === null || value === undefined) return null;

    switch (field.type) {
      case 'date':
        // Ensure date is in ISO format
        if (typeof value === 'string') {
          const date = new Date(value);
          return date.toISOString().split('T')[0];
        }
        return value;

      case 'currency':
        // Ensure currency values are numbers
        if (typeof value === 'string') {
          // Remove currency symbols and parse
          const numericValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
          return isNaN(numericValue) ? value : numericValue;
        }
        return value;

      default:
        return value;
    }
  }

  private calculateOverallConfidence(fieldConfidences: Record<string, number>): number {
    const confidences = Object.values(fieldConfidences);
    if (confidences.length === 0) return 0;

    const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    const min = Math.min(...confidences);

    // Weighted average favoring the minimum confidence
    return (average * 0.7) + (min * 0.3);
  }

  // Template management
  createTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: DocumentTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(id, newTemplate);
    return id;
  }

  updateTemplate(id: string, updates: Partial<DocumentTemplate>): boolean {
    const template = this.templates.get(id);
    if (template) {
      this.templates.set(id, { ...template, ...updates, updatedAt: new Date() });
      return true;
    }
    return false;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  getTemplate(id: string): DocumentTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values());
  }

  // Pipeline management
  createPipeline(pipeline: Omit<DocumentProcessingPipeline, 'id' | 'createdAt'>): string {
    const id = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPipeline: DocumentProcessingPipeline = {
      ...pipeline,
      id,
      createdAt: new Date()
    };

    this.pipelines.set(id, newPipeline);
    return id;
  }

  getPipeline(id: string): DocumentProcessingPipeline | undefined {
    return this.pipelines.get(id);
  }

  // Batch processing
  async processBatch(
    documents: Array<{ buffer: ArrayBuffer; type: string; options?: any }>,
    options: {
      parallel: boolean;
      onProgress?: (completed: number, total: number) => void;
      onDocumentComplete?: (index: number, result: DocumentAnalysis) => void;
    } = { parallel: true }
  ): Promise<DocumentAnalysis[]> {
    const results: DocumentAnalysis[] = [];

    if (options.parallel) {
      // Process in parallel
      const promises = documents.map(async (doc, index) => {
        try {
          const result = await this.processDocument(doc.buffer, doc.type, doc.options);
          options.onDocumentComplete?.(index, result);
          return result;
        } catch (error) {
          console.error(`Failed to process document ${index}:`, error);
          // Return a failed analysis
          return {
            documentId: `failed_${index}`,
            templateId: 'unknown',
            extractedData: {},
            confidence: 0,
            fieldConfidences: {},
            processingTime: 0,
            structuredData: {},
            validationErrors: [{ field: 'general', error: 'Processing failed' }],
            createdAt: new Date()
          } as DocumentAnalysis;
        }
      });

      const batchResults = await Promise.allSettled(promises);
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
        options.onProgress?.(results.length, documents.length);
      }
    } else {
      // Process sequentially
      for (let i = 0; i < documents.length; i++) {
        try {
          const result = await this.processDocument(documents[i].buffer, documents[i].type, documents[i].options);
          results.push(result);
          options.onDocumentComplete?.(i, result);
        } catch (error) {
          console.error(`Failed to process document ${i}:`, error);
          results.push({
            documentId: `failed_${i}`,
            templateId: 'unknown',
            extractedData: {},
            confidence: 0,
            fieldConfidences: {},
            processingTime: 0,
            structuredData: {},
            validationErrors: [{ field: 'general', error: 'Processing failed' }],
            createdAt: new Date()
          } as DocumentAnalysis);
        }
        options.onProgress?.(i + 1, documents.length);
      }
    }

    return results;
  }
}

// Singleton instance
export const documentProcessor = new IntelligentDocumentProcessor();