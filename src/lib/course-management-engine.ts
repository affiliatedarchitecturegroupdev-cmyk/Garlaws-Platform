import { PropertyData } from '@/lib/types/property';

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: 'property_management' | 'compliance' | 'technical' | 'business' | 'certification';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  language: string;
  instructorId: string;
  thumbnailUrl?: string;
  price: number;
  currency: string;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string[];
  prerequisites: string[]; // course IDs
  learningObjectives: string[];
  modules: CourseModule[];
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastPublishedAt?: Date;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // minutes
  isPublished: boolean;
  content: ModuleContent[];
  quiz?: Quiz;
  assignment?: Assignment;
  resources: LearningResource[];
}

export interface ModuleContent {
  id: string;
  type: 'video' | 'text' | 'image' | 'document' | 'interactive' | 'simulation';
  title: string;
  description?: string;
  content: VideoContent | TextContent | ImageContent | DocumentContent | InteractiveContent | SimulationContent;
  duration?: number; // seconds
  order: number;
  isPreview: boolean; // available before enrollment
}

export interface VideoContent {
  url: string;
  thumbnailUrl?: string;
  transcript?: string;
  captions?: Caption[];
  quality: 'SD' | 'HD' | '4K';
  format: string;
}

export interface TextContent {
  content: string;
  format: 'markdown' | 'html';
  wordCount: number;
}

export interface ImageContent {
  url: string;
  alt: string;
  caption?: string;
}

export interface DocumentContent {
  url: string;
  format: 'pdf' | 'doc' | 'ppt';
  size: number; // bytes
  pages?: number;
}

export interface InteractiveContent {
  type: 'quiz' | 'exercise' | 'simulation' | 'scenario';
  data: any; // Flexible structure for different interactive types
}

export interface SimulationContent {
  type: 'property_design' | 'compliance_scenario' | 'maintenance_workflow';
  scenario: any;
  objectives: string[];
}

export interface Caption {
  language: string;
  url: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // minutes
  attemptsAllowed: number;
  randomizeQuestions: boolean;
  showResults: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[]; // can be multiple for matching
  explanation?: string;
  points: number;
  timeLimit?: number; // seconds
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'file_upload' | 'peer_review' | 'project';
  instructions: string;
  dueDate?: Date;
  maxPoints: number;
  rubric?: GradingRubric;
  submissionType: 'individual' | 'group';
  peerReviewEnabled: boolean;
}

export interface GradingRubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  name: string;
  description: string;
  levels: RubricLevel[];
  weight: number;
}

export interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'download' | 'link' | 'tool';
  url: string;
  description?: string;
  isRequired: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'expired';
  enrolledAt: Date;
  completedAt?: Date;
  progress: CourseProgress;
  certificateEarned?: boolean;
  certificateUrl?: string;
  lastAccessedAt?: Date;
  expiryDate?: Date;
}

export interface CourseProgress {
  completedModules: string[]; // module IDs
  currentModule?: string;
  overallProgress: number; // percentage
  timeSpent: number; // minutes
  quizScores: Record<string, number>; // quizId -> score
  assignmentSubmissions: AssignmentSubmission[];
  lastActivity: Date;
}

export interface AssignmentSubmission {
  assignmentId: string;
  submittedAt: Date;
  content: string;
  attachments?: string[];
  status: 'submitted' | 'graded' | 'returned';
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // hours
  courses: PathCourse[];
  prerequisites: string[]; // learning path IDs
  skills: string[];
  certifications: string[]; // certification IDs
  isPublished: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PathCourse {
  courseId: string;
  order: number;
  isRequired: boolean;
  estimatedTime: number; // minutes
}

export interface Certification {
  id: string;
  title: string;
  description: string;
  category: 'property_management' | 'compliance' | 'technical' | 'business';
  level: 'foundation' | 'intermediate' | 'advanced' | 'expert';
  issuingOrganization: string;
  validityPeriod: number; // months
  prerequisites: CertificationPrerequisite[];
  requirements: CertificationRequirement[];
  exam?: CertificationExam;
  fee: number;
  currency: string;
  isActive: boolean;
  issueCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificationPrerequisite {
  type: 'course' | 'experience' | 'certification' | 'assessment';
  value: string;
  description: string;
}

export interface CertificationRequirement {
  type: 'courses_completed' | 'assessment_passed' | 'experience_years' | 'projects_completed';
  value: string | number;
  description: string;
}

export interface CertificationExam {
  id: string;
  title: string;
  duration: number; // minutes
  questions: number;
  passingScore: number;
  attemptsAllowed: number;
  format: 'online' | 'proctored' | 'practical';
  fee: number;
}

export interface UserCertification {
  id: string;
  userId: string;
  certificationId: string;
  status: 'in_progress' | 'completed' | 'expired' | 'revoked';
  issuedAt?: Date;
  expiresAt?: Date;
  certificateNumber: string;
  certificateUrl?: string;
  verificationCode: string;
}

export class CourseManagementEngine {
  private courses: Map<string, Course> = new Map();
  private enrollments: Map<string, Enrollment> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();
  private certifications: Map<string, Certification> = new Map();
  private userCertifications: Map<string, UserCertification> = new Map();

  constructor() {
    this.initializeDefaultCourses();
    this.initializeCertifications();
  }

  // Course Management
  async createCourse(course: Omit<Course, 'id' | 'enrollmentCount' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.courses.set(newCourse.id, newCourse);
    return newCourse;
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course | null> {
    const course = this.courses.get(courseId);
    if (!course) return null;

    const updatedCourse = { ...course, ...updates, updatedAt: new Date() };
    this.courses.set(courseId, updatedCourse);
    return updatedCourse;
  }

  async publishCourse(courseId: string): Promise<boolean> {
    const course = this.courses.get(courseId);
    if (!course) return false;

    course.isPublished = true;
    course.lastPublishedAt = new Date();
    course.updatedAt = new Date();
    return true;
  }

  getCourses(filters?: {
    category?: string;
    level?: string;
    instructorId?: string;
    isPublished?: boolean;
    limit?: number;
  }): Course[] {
    let courses = Array.from(this.courses.values());

    if (filters) {
      courses = courses.filter(course => {
        if (filters.category && course.category !== filters.category) return false;
        if (filters.level && course.level !== filters.level) return false;
        if (filters.instructorId && course.instructorId !== filters.instructorId) return false;
        if (filters.isPublished !== undefined && course.isPublished !== filters.isPublished) return false;
        return true;
      });
    }

    // Sort by creation date (newest first)
    courses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.limit) {
      courses = courses.slice(0, filters.limit);
    }

    return courses;
  }

  getCourse(courseId: string): Course | null {
    return this.courses.get(courseId) || null;
  }

  // Enrollment Management
  async enrollUser(userId: string, courseId: string): Promise<Enrollment> {
    const course = this.courses.get(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check prerequisites
    const unmetPrerequisites = this.checkPrerequisites(userId, course.prerequisites);
    if (unmetPrerequisites.length > 0) {
      throw new Error(`Prerequisites not met: ${unmetPrerequisites.join(', ')}`);
    }

    const enrollment: Enrollment = {
      id: `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      courseId,
      status: 'enrolled',
      enrolledAt: new Date(),
      progress: {
        completedModules: [],
        overallProgress: 0,
        timeSpent: 0,
        quizScores: {},
        assignmentSubmissions: [],
        lastActivity: new Date()
      }
    };

    this.enrollments.set(enrollment.id, enrollment);

    // Update course enrollment count
    course.enrollmentCount++;
    course.updatedAt = new Date();

    return enrollment;
  }

  async updateProgress(enrollmentId: string, moduleId: string, progress: Partial<CourseProgress>): Promise<boolean> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) return false;

    enrollment.progress = { ...enrollment.progress, ...progress, lastActivity: new Date() };
    // Note: Enrollment interface doesn't have updatedAt, but we could add it if needed

    // Calculate overall progress
    const course = this.courses.get(enrollment.courseId);
    if (course) {
      const totalModules = course.modules.length;
      const completedModules = enrollment.progress.completedModules.length;
      enrollment.progress.overallProgress = Math.round((completedModules / totalModules) * 100);

      // Check if course is completed
      if (enrollment.progress.overallProgress === 100 && enrollment.status === 'in_progress') {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
    }

    return true;
  }

  getUserEnrollments(userId: string): Enrollment[] {
    return Array.from(this.enrollments.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime());
  }

  getEnrollment(enrollmentId: string): Enrollment | null {
    return this.enrollments.get(enrollmentId) || null;
  }

  // Learning Paths
  async createLearningPath(path: Omit<LearningPath, 'id' | 'enrollmentCount' | 'createdAt' | 'updatedAt'>): Promise<LearningPath> {
    const newPath: LearningPath = {
      ...path,
      id: `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      enrollmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.learningPaths.set(newPath.id, newPath);
    return newPath;
  }

  getLearningPaths(category?: string): LearningPath[] {
    const paths = Array.from(this.learningPaths.values());
    return category ? paths.filter(p => p.category === category) : paths;
  }

  getLearningPath(pathId: string): LearningPath | null {
    return this.learningPaths.get(pathId) || null;
  }

  // Certification Management
  async createCertification(cert: Omit<Certification, 'id' | 'issueCount' | 'createdAt' | 'updatedAt'>): Promise<Certification> {
    const newCert: Certification = {
      ...cert,
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      issueCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.certifications.set(newCert.id, newCert);
    return newCert;
  }

  async awardCertification(userId: string, certificationId: string): Promise<UserCertification> {
    const certification = this.certifications.get(certificationId);
    if (!certification) {
      throw new Error('Certification not found');
    }

    // Check if user meets requirements
    const meetsRequirements = await this.checkCertificationRequirements(userId, certification);
    if (!meetsRequirements) {
      throw new Error('User does not meet certification requirements');
    }

    const userCert: UserCertification = {
      id: `user-cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      certificationId,
      status: 'completed',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + certification.validityPeriod * 30 * 24 * 60 * 60 * 1000), // months to milliseconds
      certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      verificationCode: Math.random().toString(36).substr(2, 12).toUpperCase()
    };

    this.userCertifications.set(userCert.id, userCert);

    // Update certification issue count
    certification.issueCount++;
    certification.updatedAt = new Date();

    return userCert;
  }

  getCertifications(category?: string): Certification[] {
    const certs = Array.from(this.certifications.values());
    return category ? certs.filter(c => c.category === category) : certs;
  }

  getUserCertifications(userId: string): UserCertification[] {
    return Array.from(this.userCertifications.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => (b.issuedAt?.getTime() || 0) - (a.issuedAt?.getTime() || 0));
  }

  // Analytics and Reporting
  getCourseAnalytics(courseId: string): any {
    const course = this.courses.get(courseId);
    if (!course) return null;

    const enrollments = Array.from(this.enrollments.values())
      .filter(e => e.courseId === courseId);

    const completions = enrollments.filter(e => e.status === 'completed');
    const inProgress = enrollments.filter(e => e.status === 'in_progress');

    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress.overallProgress, 0) / enrollments.length
      : 0;

    return {
      courseId,
      totalEnrollments: enrollments.length,
      completions: completions.length,
      completionRate: enrollments.length > 0 ? (completions.length / enrollments.length) * 100 : 0,
      averageProgress: Math.round(avgProgress),
      activeLearners: inProgress.length,
      averageTimeSpent: enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.progress.timeSpent, 0) / enrollments.length
        : 0,
      dropOffRate: enrollments.length > 0
        ? (enrollments.filter(e => e.status === 'dropped').length / enrollments.length) * 100
        : 0
    };
  }

  // Helper Methods
  private checkPrerequisites(userId: string, prerequisiteCourseIds: string[]): string[] {
    const userEnrollments = this.getUserEnrollments(userId);
    const completedCourseIds = userEnrollments
      .filter(e => e.status === 'completed')
      .map(e => e.courseId);

    return prerequisiteCourseIds.filter(id => !completedCourseIds.includes(id));
  }

  private async checkCertificationRequirements(userId: string, certification: Certification): Promise<boolean> {
    // Check course completion requirements
    const courseRequirements = certification.requirements.filter(r => r.type === 'courses_completed');
    for (const req of courseRequirements) {
      const requiredCourses = (req.value as string).split(',');
      const userEnrollments = this.getUserEnrollments(userId);
      const completedCourses = userEnrollments
        .filter(e => e.status === 'completed')
        .map(e => e.courseId);

      if (!requiredCourses.every(courseId => completedCourses.includes(courseId))) {
        return false;
      }
    }

    // Check assessment requirements
    const assessmentRequirements = certification.requirements.filter(r => r.type === 'assessment_passed');
    // Implementation would check assessment results

    return true; // Simplified - would implement full requirement checking
  }

  private initializeDefaultCourses(): void {
    // Property Management Fundamentals
    this.createCourse({
      title: 'Property Management Fundamentals',
      description: 'Complete guide to property management best practices, from tenant screening to maintenance coordination.',
      shortDescription: 'Master the essentials of property management',
      category: 'property_management',
      level: 'beginner',
      duration: 480, // 8 hours
      language: 'en',
      instructorId: 'instructor-1',
      price: 199,
      currency: 'USD',
      isPublished: true,
      isFeatured: true,
      tags: ['property', 'management', 'fundamentals', 'tenant', 'leasing'],
      prerequisites: [],
      learningObjectives: [
        'Understand property management principles',
        'Master tenant screening and leasing processes',
        'Learn maintenance coordination techniques',
        'Understand financial aspects of property management'
      ],
      modules: [
        {
          id: 'module-1',
          title: 'Introduction to Property Management',
          description: 'Overview of the property management industry',
          order: 1,
          duration: 60,
          isPublished: true,
          content: [],
          resources: []
        }
        // Would include full module structure
      ]
    });

    // Compliance Training Course
    this.createCourse({
      title: 'POPIA Compliance for Property Managers',
      description: 'Comprehensive training on data protection regulations and compliance requirements.',
      shortDescription: 'Master POPIA compliance requirements',
      category: 'compliance',
      level: 'intermediate',
      duration: 360,
      language: 'en',
      instructorId: 'instructor-2',
      price: 299,
      currency: 'USD',
      isPublished: true,
      isFeatured: false,
      tags: ['compliance', 'POPIA', 'data-protection', 'regulatory'],
      prerequisites: [],
      learningObjectives: [
        'Understand POPIA requirements',
        'Learn data collection and processing rules',
        'Master data subject rights handling',
        'Implement compliance procedures'
      ],
      modules: []
    });
  }

  private initializeCertifications(): void {
    // Certified Property Manager
    this.createCertification({
      title: 'Certified Property Manager (CPM)',
      description: 'Professional certification for property management excellence',
      category: 'property_management',
      level: 'intermediate',
      issuingOrganization: 'Garlaws Academy',
      validityPeriod: 24, // 2 years
      prerequisites: [],
      requirements: [
        {
          type: 'courses_completed',
          value: 'course-property-fundamentals,course-lease-management',
          description: 'Complete required coursework'
        },
        {
          type: 'assessment_passed',
          value: 'exam-cpm',
          description: 'Pass certification examination'
        },
        {
          type: 'experience_years',
          value: 2,
          description: 'Minimum 2 years property management experience'
        }
      ],
      exam: {
        id: 'exam-cpm',
        title: 'Certified Property Manager Examination',
        duration: 180, // 3 hours
        questions: 150,
        passingScore: 70,
        attemptsAllowed: 3,
        format: 'online',
        fee: 500
      },
      fee: 750,
      currency: 'USD',
      isActive: true
    });

    // Compliance Officer Certification
    this.createCertification({
      title: 'Certified Compliance Officer (CCO)',
      description: 'Specialized certification for regulatory compliance management',
      category: 'compliance',
      level: 'advanced',
      issuingOrganization: 'Garlaws Academy',
      validityPeriod: 12, // 1 year
      prerequisites: [],
      requirements: [
        {
          type: 'courses_completed',
          value: 'course-popi-compliance,course-bbbee-compliance',
          description: 'Complete compliance coursework'
        },
        {
          type: 'assessment_passed',
          value: 'cert-cpm-assessment',
          description: 'Pass Certified Property Manager assessment'
        }
      ],
      exam: {
        id: 'exam-cco',
        title: 'Compliance Officer Certification Exam',
        duration: 240, // 4 hours
        questions: 200,
        passingScore: 75,
        attemptsAllowed: 2,
        format: 'proctored',
        fee: 750
      },
      fee: 1200,
      currency: 'USD',
      isActive: true
    });
  }
}

export const courseManagementEngine = new CourseManagementEngine();