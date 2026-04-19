import { NextRequest, NextResponse } from 'next/server';
import { courseManagementEngine, Certification, UserCertification, Quiz, QuizQuestion } from '@/lib/course-management-engine';

// In-memory storage for assessments and results
const quizAttempts: Map<string, any> = new Map();
const assessmentResults: Map<string, any> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const certificationId = searchParams.get('certificationId');

    switch (action) {
      case 'certifications':
        const category = searchParams.get('category');
        const certifications = courseManagementEngine.getCertifications(category || undefined);
        return NextResponse.json({
          success: true,
          data: certifications
        });

      case 'certification':
        if (!certificationId) {
          return NextResponse.json(
            { error: 'certificationId parameter required' },
            { status: 400 }
          );
        }
        const certification = courseManagementEngine.getCertifications().find(c => c.id === certificationId);
        if (!certification) {
          return NextResponse.json(
            { error: 'Certification not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: certification
        });

      case 'user_certifications':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId parameter required' },
            { status: 400 }
          );
        }
        const userCerts = courseManagementEngine.getUserCertifications(userId);
        return NextResponse.json({
          success: true,
          data: userCerts
        });

      case 'certification_eligibility':
        if (!userId || !certificationId) {
          return NextResponse.json(
            { error: 'userId and certificationId parameters required' },
            { status: 400 }
          );
        }
        const eligibility = await checkCertificationEligibility(userId, certificationId);
        return NextResponse.json({
          success: true,
          data: eligibility
        });

      case 'exam_questions':
        const examId = searchParams.get('examId');
        if (!examId) {
          return NextResponse.json(
            { error: 'examId parameter required' },
            { status: 400 }
          );
        }
        const questions = await getExamQuestions(examId);
        return NextResponse.json({
          success: true,
          data: questions
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: certifications, certification, user_certifications, certification_eligibility, or exam_questions' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching certification data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_certification':
        const certData: Omit<Certification, 'id' | 'issueCount' | 'createdAt' | 'updatedAt'> = body;
        const newCert = await courseManagementEngine.createCertification(certData);
        return NextResponse.json({
          success: true,
          data: newCert
        }, { status: 201 });

      case 'award_certification':
        if (!body.userId || !body.certificationId) {
          return NextResponse.json(
            { error: 'userId and certificationId are required' },
            { status: 400 }
          );
        }

        const userCert = await courseManagementEngine.awardCertification(body.userId, body.certificationId);
        return NextResponse.json({
          success: true,
          data: userCert
        });

      case 'start_assessment':
        if (!body.userId || !body.assessmentId) {
          return NextResponse.json(
            { error: 'userId and assessmentId are required' },
            { status: 400 }
          );
        }

        const attempt = await startAssessmentAttempt(body.userId, body.assessmentId);
        return NextResponse.json({
          success: true,
          data: attempt
        });

      case 'submit_assessment':
        if (!body.attemptId || !body.answers) {
          return NextResponse.json(
            { error: 'attemptId and answers are required' },
            { status: 400 }
          );
        }

        const result = await submitAssessmentAnswers(body.attemptId, body.answers);
        return NextResponse.json({
          success: true,
          data: result
        });

      case 'validate_certificate':
        if (!body.certificateNumber || !body.verificationCode) {
          return NextResponse.json(
            { error: 'certificateNumber and verificationCode are required' },
            { status: 400 }
          );
        }

        const validation = await validateCertificate(body.certificateNumber, body.verificationCode);
        return NextResponse.json({
          success: true,
          data: validation
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: create_certification, award_certification, start_assessment, submit_assessment, or validate_certificate' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing certification operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform certification operation' },
      { status: 500 }
    );
  }
}

// Helper functions
async function checkCertificationEligibility(userId: string, certificationId: string): Promise<any> {
  const certification = courseManagementEngine.getCertifications().find(c => c.id === certificationId);
  if (!certification) {
    throw new Error('Certification not found');
  }

  const userEnrollments = courseManagementEngine.getUserEnrollments(userId);
  const completedCourses = userEnrollments.filter(e => e.status === 'completed');
  const userCerts = courseManagementEngine.getUserCertifications(userId);

  const eligibility = {
    certificationId,
    isEligible: true,
    requirements: {
      courses: [] as any[],
      assessments: [] as any[],
      experience: [] as any[],
      certifications: [] as any[]
    },
    missingRequirements: [] as string[]
  };

  // Check course completion requirements
  for (const req of certification.requirements) {
    switch (req.type) {
      case 'courses_completed':
        const requiredCourses = (req.value as string).split(',');
        const completedCourseIds = completedCourses.map(e => e.courseId);

        eligibility.requirements.courses.push({
          required: requiredCourses,
          completed: requiredCourses.filter(courseId => completedCourseIds.includes(courseId)),
          status: requiredCourses.every(courseId => completedCourseIds.includes(courseId)) ? 'met' : 'not_met'
        });

        if (!requiredCourses.every(courseId => completedCourseIds.includes(courseId))) {
          eligibility.isEligible = false;
          eligibility.missingRequirements.push(`Required courses: ${requiredCourses.filter(courseId => !completedCourseIds.includes(courseId)).join(', ')}`);
        }
        break;

      case 'assessment_passed':
        // Check if user has passed required assessments
        const passedAssessments = assessmentResults.get(userId) || [];
        const hasPassed = passedAssessments.some((result: any) => result.assessmentId === req.value && result.passed);

        eligibility.requirements.assessments.push({
          assessmentId: req.value,
          passed: hasPassed,
          status: hasPassed ? 'met' : 'not_met'
        });

        if (!hasPassed) {
          eligibility.isEligible = false;
          eligibility.missingRequirements.push(`Assessment not passed: ${req.value}`);
        }
        break;

      // Certification prerequisites are checked separately
    }
  }

  return eligibility;
}

async function startAssessmentAttempt(userId: string, assessmentId: string): Promise<any> {
  // Check if user can take this assessment
  const existingAttempts = Array.from(quizAttempts.values())
    .filter((attempt: any) => attempt.userId === userId && attempt.assessmentId === assessmentId);

  // Check attempt limits
  if (existingAttempts.length >= 3) { // Default limit
    throw new Error('Maximum attempts exceeded for this assessment');
  }

  const attempt = {
    attemptId: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    assessmentId,
    startedAt: new Date(),
    status: 'in_progress',
    answers: [] as any[],
    timeRemaining: 3600 // 1 hour in seconds
  };

  quizAttempts.set(attempt.attemptId, attempt);
  return attempt;
}

async function submitAssessmentAnswers(attemptId: string, answers: any[]): Promise<any> {
  const attempt = quizAttempts.get(attemptId);
  if (!attempt) {
    throw new Error('Assessment attempt not found');
  }

  if (attempt.status !== 'in_progress') {
    throw new Error('Assessment attempt is not in progress');
  }

  // Record answers
  attempt.answers = answers;
  attempt.submittedAt = new Date();
  attempt.status = 'submitted';

  // Grade the assessment
  const result = await gradeAssessment(attempt);

  // Store result
  assessmentResults.set(`${attempt.userId}-${attempt.assessmentId}`, result);

  // Update attempt
  attempt.result = result;
  attempt.status = 'completed';

  return result;
}

async function gradeAssessment(attempt: any): Promise<any> {
  // Simplified grading logic - in production, this would properly grade based on quiz questions
  const totalQuestions = 50; // Mock value
  const correctAnswers = Math.floor(Math.random() * totalQuestions * 0.8) + totalQuestions * 0.2; // 20-100% correct

  const score = (correctAnswers / totalQuestions) * 100;
  const passed = score >= 70; // 70% passing score

  return {
    assessmentId: attempt.assessmentId,
    totalQuestions,
    correctAnswers,
    score: Math.round(score),
    passed,
    grade: passed ? 'Pass' : 'Fail',
    feedback: passed
      ? 'Congratulations! You have successfully passed this assessment.'
      : 'Unfortunately, you did not meet the passing criteria. Please review the material and try again.',
    breakdown: {
      byTopic: {
        'Property Management': { correct: Math.floor(correctAnswers * 0.4), total: Math.floor(totalQuestions * 0.4) },
        'Compliance': { correct: Math.floor(correctAnswers * 0.3), total: Math.floor(totalQuestions * 0.3) },
        'Technical Skills': { correct: Math.floor(correctAnswers * 0.3), total: Math.floor(totalQuestions * 0.3) }
      }
    },
    nextSteps: passed
      ? ['Proceed to certification application', 'Schedule practical assessment if required']
      : ['Review study materials', 'Focus on weak areas', 'Retake assessment after preparation']
  };
}

async function getExamQuestions(examId: string): Promise<QuizQuestion[]> {
  // Mock questions - in production, this would retrieve actual questions from database
  const questions: QuizQuestion[] = [];

  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: `q-${examId}-${i}`,
      type: 'multiple_choice',
      question: `Sample question ${i} for exam ${examId}?`,
      options: [
        'Option A',
        'Option B',
        'Option C',
        'Option D'
      ],
      correctAnswer: 'Option A',
      explanation: 'This is the correct answer because...',
      points: 1,
      timeLimit: 60
    });
  }

  return questions;
}

async function validateCertificate(certificateNumber: string, verificationCode: string): Promise<any> {
  // Find certificate by number and verification code
  const allUserCerts = Array.from(courseManagementEngine.getCertifications().keys())
    .flatMap(certId => {
      // This is a simplified approach - in production, you'd have a proper database query
      return [];
    });

  // Mock validation
  const isValid = certificateNumber.startsWith('CERT-') && verificationCode.length === 12;

  if (isValid) {
    return {
      valid: true,
      certificate: {
        number: certificateNumber,
        holder: 'John Doe', // Would look up actual holder
        certification: 'Certified Property Manager',
        issuedDate: '2024-01-15',
        expiryDate: '2027-01-15',
        issuingOrganization: 'Garlaws Academy'
      },
      verificationCode: verificationCode,
      verifiedAt: new Date()
    };
  } else {
    return {
      valid: false,
      error: 'Certificate not found or verification code is invalid'
    };
  }
}

// Assessment monitoring and analytics
export async function GET_ASSESSMENT_ANALYTICS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId parameter required' },
        { status: 400 }
      );
    }

    const analytics = await getAssessmentAnalytics(assessmentId);
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching assessment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment analytics' },
      { status: 500 }
    );
  }
}

async function getAssessmentAnalytics(assessmentId: string): Promise<any> {
  const attempts = Array.from(quizAttempts.values())
    .filter((attempt: any) => attempt.assessmentId === assessmentId);

  const results = Array.from(assessmentResults.values())
    .filter((result: any) => result.assessmentId === assessmentId);

  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter((a: any) => a.status === 'completed').length;
  const passedAttempts = results.filter((r: any) => r.passed).length;
  const failedAttempts = results.filter((r: any) => !r.passed).length;

  const averageScore = results.length > 0
    ? results.reduce((sum: number, r: any) => sum + r.score, 0) / results.length
    : 0;

  const passRate = completedAttempts > 0 ? (passedAttempts / completedAttempts) * 100 : 0;

  // Question-level analytics
  const questionStats = {
    totalQuestions: 50, // Mock
    averageTimePerQuestion: 45, // seconds
    mostMissedQuestions: [5, 12, 18], // Question numbers
    difficultyBreakdown: {
      easy: 30,
      medium: 15,
      hard: 5
    }
  };

  return {
    assessmentId,
    overview: {
      totalAttempts,
      completedAttempts,
      passedAttempts,
      failedAttempts,
      passRate: Math.round(passRate),
      averageScore: Math.round(averageScore)
    },
    performance: {
      scoreDistribution: {
        '90-100': results.filter((r: any) => r.score >= 90).length,
        '80-89': results.filter((r: any) => r.score >= 80 && r.score < 90).length,
        '70-79': results.filter((r: any) => r.score >= 70 && r.score < 80).length,
        '60-69': results.filter((r: any) => r.score >= 60 && r.score < 70).length,
        '0-59': results.filter((r: any) => r.score < 60).length
      },
      timeAnalysis: {
        averageCompletionTime: 45 * 60, // 45 minutes in seconds
        fastestCompletion: 30 * 60,
        slowestCompletion: 60 * 60
      }
    },
    questions: questionStats,
    trends: {
      attemptsOverTime: [
        { date: '2024-01-01', attempts: 10 },
        { date: '2024-01-08', attempts: 15 },
        { date: '2024-01-15', attempts: 12 }
      ],
      passRateOverTime: [
        { date: '2024-01-01', passRate: 75 },
        { date: '2024-01-08', passRate: 80 },
        { date: '2024-01-15', passRate: 78 }
      ]
    },
    recommendations: generateAssessmentRecommendations(results)
  };
}

function generateAssessmentRecommendations(results: any[]): string[] {
  const recommendations: string[] = [];

  if (results.length === 0) {
    recommendations.push('No assessment data available yet');
    return recommendations;
  }

  const averageScore = results.reduce((sum: number, r: any) => sum + r.score, 0) / results.length;
  const passRate = results.filter((r: any) => r.passed).length / results.length * 100;

  if (averageScore < 70) {
    recommendations.push('Consider revising assessment content - average score is below passing threshold');
  }

  if (passRate < 60) {
    recommendations.push('High failure rate detected - review question difficulty and prerequisites');
  }

  const difficultQuestions = [5, 12, 18]; // Mock difficult questions
  if (difficultQuestions.length > 0) {
    recommendations.push(`Review questions ${difficultQuestions.join(', ')} - commonly missed by candidates`);
  }

  recommendations.push('Consider adding more practice questions for difficult topics');

  return recommendations;
}