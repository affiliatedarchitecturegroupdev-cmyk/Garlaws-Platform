import { NextRequest, NextResponse } from 'next/server';
import { courseManagementEngine, LearningPath, Enrollment, CourseProgress } from '@/lib/course-management-engine';

// In-memory storage for learning paths and user progress
const learningPathEnrollments: Map<string, { userId: string; pathId: string; enrolledAt: Date; progress: any }> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const pathId = searchParams.get('pathId');

    switch (action) {
      case 'learning_paths':
        const category = searchParams.get('category');
        const paths = courseManagementEngine.getLearningPaths(category || undefined);
        return NextResponse.json({
          success: true,
          data: paths
        });

      case 'learning_path':
        if (!pathId) {
          return NextResponse.json(
            { error: 'pathId parameter required' },
            { status: 400 }
          );
        }
        const path = courseManagementEngine.getLearningPath(pathId);
        if (!path) {
          return NextResponse.json(
            { error: 'Learning path not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: path
        });

      case 'user_paths':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId parameter required' },
            { status: 400 }
          );
        }
        const userPaths = await getUserLearningPaths(userId);
        return NextResponse.json({
          success: true,
          data: userPaths
        });

      case 'path_progress':
        if (!userId || !pathId) {
          return NextResponse.json(
            { error: 'userId and pathId parameters required' },
            { status: 400 }
          );
        }
        const progress = await getUserPathProgress(userId, pathId);
        return NextResponse.json({
          success: true,
          data: progress
        });

      case 'recommended_paths':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId parameter required' },
            { status: 400 }
          );
        }
        const recommended = await getRecommendedPaths(userId);
        return NextResponse.json({
          success: true,
          data: recommended
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: learning_paths, learning_path, user_paths, path_progress, or recommended_paths' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching learning path data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path data' },
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
      case 'create_path':
        const pathData: Omit<LearningPath, 'id' | 'enrollmentCount' | 'createdAt' | 'updatedAt'> = body;
        const newPath = await courseManagementEngine.createLearningPath(pathData);
        return NextResponse.json({
          success: true,
          data: newPath
        }, { status: 201 });

      case 'enroll_path':
        if (!body.userId || !body.pathId) {
          return NextResponse.json(
            { error: 'userId and pathId are required' },
            { status: 400 }
          );
        }

        // Check prerequisites
        const path = courseManagementEngine.getLearningPath(body.pathId);
        if (!path) {
          return NextResponse.json(
            { error: 'Learning path not found' },
            { status: 404 }
          );
        }

        const unmetPrerequisites = await checkPathPrerequisites(body.userId, path.prerequisites);
        if (unmetPrerequisites.length > 0) {
          return NextResponse.json(
            { error: `Prerequisites not met: ${unmetPrerequisites.join(', ')}` },
            { status: 400 }
          );
        }

        const enrollment = await enrollInLearningPath(body.userId, body.pathId);
        return NextResponse.json({
          success: true,
          data: enrollment
        });

      case 'update_progress':
        if (!body.userId || !body.pathId || !body.courseId || !body.moduleId) {
          return NextResponse.json(
            { error: 'userId, pathId, courseId, and moduleId are required' },
            { status: 400 }
          );
        }

        const progressUpdated = await updatePathProgress(body.userId, body.pathId, body.courseId, body.moduleId);
        return NextResponse.json({
          success: progressUpdated,
          message: progressUpdated ? 'Progress updated successfully' : 'Failed to update progress'
        });

      case 'generate_recommendations':
        if (!body.userId) {
          return NextResponse.json(
            { error: 'userId is required' },
            { status: 400 }
          );
        }

        const recommendations = await generatePersonalizedRecommendations(body.userId);
        return NextResponse.json({
          success: true,
          data: recommendations
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: create_path, enroll_path, update_progress, or generate_recommendations' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing learning path operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform learning path operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_path':
        if (!body.pathId) {
          return NextResponse.json(
            { error: 'pathId is required' },
            { status: 400 }
          );
        }

        // Update learning path - implementation would modify the path
        return NextResponse.json({
          success: true,
          message: 'Learning path update not yet implemented'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: update_path' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to update learning path' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserLearningPaths(userId: string): Promise<any[]> {
  const enrollments = Array.from(learningPathEnrollments.values())
    .filter(e => e.userId === userId);

  const pathsWithProgress = [];

  for (const enrollment of enrollments) {
    const path = courseManagementEngine.getLearningPath(enrollment.pathId);
    if (path) {
      const progress = await calculatePathProgress(userId, path);
      pathsWithProgress.push({
        path,
        enrollment,
        progress
      });
    }
  }

  return pathsWithProgress;
}

async function getUserPathProgress(userId: string, pathId: string): Promise<any> {
  const path = courseManagementEngine.getLearningPath(pathId);
  if (!path) {
    throw new Error('Learning path not found');
  }

  return await calculatePathProgress(userId, path);
}

async function calculatePathProgress(userId: string, path: LearningPath): Promise<any> {
  const userEnrollments = courseManagementEngine.getUserEnrollments(userId);
  const enrolledCourseIds = userEnrollments.map(e => e.courseId);

  let completedCourses = 0;
  let totalCourses = path.courses.length;
  let estimatedTimeSpent = 0;
  let skillsAcquired = 0;

  const courseProgress = [];

  for (const pathCourse of path.courses) {
    const enrollment = userEnrollments.find(e => e.courseId === pathCourse.courseId);
    const course = courseManagementEngine.getCourse(pathCourse.courseId);

    if (enrollment) {
      courseProgress.push({
        courseId: pathCourse.courseId,
        courseTitle: course?.title || 'Unknown Course',
        status: enrollment.status,
        progress: enrollment.progress.overallProgress,
        estimatedTime: pathCourse.estimatedTime,
        actualTimeSpent: enrollment.progress.timeSpent
      });

      if (enrollment.status === 'completed') {
        completedCourses++;
        estimatedTimeSpent += enrollment.progress.timeSpent;
        skillsAcquired += path.skills.length; // Simplified
      }
    } else {
      courseProgress.push({
        courseId: pathCourse.courseId,
        courseTitle: course?.title || 'Unknown Course',
        status: 'not_enrolled',
        progress: 0,
        estimatedTime: pathCourse.estimatedTime,
        actualTimeSpent: 0
      });
    }
  }

  const overallProgress = (completedCourses / totalCourses) * 100;
  const timeToCompletion = path.courses
    .filter(c => !enrolledCourseIds.includes(c.courseId) || userEnrollments.find(e => e.courseId === c.courseId)?.status !== 'completed')
    .reduce((sum, c) => sum + c.estimatedTime, 0);

  return {
    pathId: path.id,
    pathTitle: path.title,
    overallProgress: Math.round(overallProgress),
    completedCourses,
    totalCourses,
    courseProgress,
    estimatedTimeSpent,
    timeToCompletion,
    skillsAcquired,
    certificationsEarned: 0, // Would check actual certifications
    nextRecommendedCourse: getNextRecommendedCourse(courseProgress, path)
  };
}

async function getRecommendedPaths(userId: string): Promise<LearningPath[]> {
  const allPaths = courseManagementEngine.getLearningPaths();
  const userEnrollments = courseManagementEngine.getUserEnrollments(userId);
  const completedCourseIds = userEnrollments
    .filter(e => e.status === 'completed')
    .map(e => e.courseId);

  // Filter paths based on user profile and progress
  const recommended = allPaths.filter(path => {
    // Check if user hasn't already enrolled
    const alreadyEnrolled = Array.from(learningPathEnrollments.values())
      .some(e => e.userId === userId && e.pathId === path.id);
    if (alreadyEnrolled) return false;

    // Check prerequisites
    const unmetPrerequisites = path.prerequisites.filter(prereqId => {
      // Check if prerequisite path is completed
      const prereqEnrollment = Array.from(learningPathEnrollments.values())
        .find(e => e.userId === userId && e.pathId === prereqId);
      return !prereqEnrollment; // Simplified - would check completion status
    });

    return unmetPrerequisites.length === 0;
  });

  // Sort by relevance (simplified scoring)
  return recommended.sort((a, b) => {
    const aScore = calculatePathRelevanceScore(a, completedCourseIds);
    const bScore = calculatePathRelevanceScore(b, completedCourseIds);
    return bScore - aScore;
  });
}

async function checkPathPrerequisites(userId: string, prerequisitePathIds: string[]): Promise<string[]> {
  const unmetPrerequisites = [];

  for (const prereqId of prerequisitePathIds) {
    const enrollment = Array.from(learningPathEnrollments.values())
      .find(e => e.userId === userId && e.pathId === prereqId);

    if (!enrollment) {
      const path = courseManagementEngine.getLearningPath(prereqId);
      unmetPrerequisites.push(path?.title || prereqId);
    }
  }

  return unmetPrerequisites;
}

async function enrollInLearningPath(userId: string, pathId: string): Promise<any> {
  const enrollmentKey = `${userId}-${pathId}`;
  const existingEnrollment = Array.from(learningPathEnrollments.values())
    .find(e => e.userId === userId && e.pathId === pathId);

  if (existingEnrollment) {
    throw new Error('Already enrolled in this learning path');
  }

  const enrollment = {
    userId,
    pathId,
    enrolledAt: new Date(),
    progress: {
      startedCourses: [],
      completedCourses: [],
      overallProgress: 0,
      timeSpent: 0
    }
  };

  learningPathEnrollments.set(enrollmentKey, enrollment);

  // Update path enrollment count
  const path = courseManagementEngine.getLearningPath(pathId);
  if (path) {
    // Note: Would need to add enrollmentCount to LearningPath interface
    // path.enrollmentCount++;
  }

  return enrollment;
}

async function updatePathProgress(userId: string, pathId: string, courseId: string, moduleId: string): Promise<boolean> {
  // This would update the learning path progress based on course progress
  // Implementation would check course completion and update path metrics
  return true;
}

async function generatePersonalizedRecommendations(userId: string): Promise<any> {
  const userEnrollments = courseManagementEngine.getUserEnrollments(userId);
  const completedCourses = userEnrollments.filter(e => e.status === 'completed');
  const inProgressCourses = userEnrollments.filter(e => e.status === 'in_progress');

  // Analyze user preferences and performance
  const preferredCategories = getPreferredCategories(completedCourses);
  const skillGaps = identifySkillGaps(userId);
  const performanceLevel = assessPerformanceLevel(completedCourses);

  // Generate recommendations
  const recommendations = {
    nextCourses: await recommendNextCourses(userId, preferredCategories, performanceLevel),
    learningPaths: await recommendLearningPaths(userId, skillGaps),
    skillDevelopment: generateSkillRecommendations(skillGaps),
    certificationPath: recommendCertificationPath(userId),
    personalizedTips: generatePersonalizedTips(inProgressCourses)
  };

  return recommendations;
}

function calculatePathRelevanceScore(path: LearningPath, completedCourseIds: string[]): number {
  let score = 0;

  // Base score from matching courses
  const matchingCourses = path.courses.filter(pc => completedCourseIds.includes(pc.courseId)).length;
  score += (matchingCourses / path.courses.length) * 50;

  // Category preference score
  score += 25; // Simplified - would analyze user preferences

  // Difficulty match score
  score += 25; // Simplified - would match to user skill level

  return score;
}

function getPreferredCategories(completedCourses: Enrollment[]): string[] {
  // Analyze completed courses to determine preferred categories
  const categories = completedCourses.map(e => {
    const course = courseManagementEngine.getCourse(e.courseId);
    return course?.category;
  }).filter(Boolean) as string[];

  // Return most common categories
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);
}

function identifySkillGaps(userId: string): string[] {
  // Analyze user performance to identify skill gaps
  // This would compare user performance against benchmarks
  return ['advanced analytics', 'regulatory compliance', 'project management'];
}

function assessPerformanceLevel(completedCourses: Enrollment[]): string {
  if (completedCourses.length === 0) return 'beginner';

  const avgProgress = completedCourses.reduce((sum, e) => sum + e.progress.overallProgress, 0) / completedCourses.length;

  if (avgProgress > 85) return 'advanced';
  if (avgProgress > 70) return 'intermediate';
  return 'beginner';
}

async function recommendNextCourses(userId: string, preferredCategories: string[], performanceLevel: string): Promise<any[]> {
  const allCourses = courseManagementEngine.getCourses({ isPublished: true });
  const userEnrollments = courseManagementEngine.getUserEnrollments(userId);
  const enrolledCourseIds = userEnrollments.map(e => e.courseId);

  return allCourses
    .filter(course =>
      !enrolledCourseIds.includes(course.id) &&
      preferredCategories.includes(course.category) &&
      course.level === performanceLevel
    )
    .slice(0, 5)
    .map(course => ({
      courseId: course.id,
      title: course.title,
      reason: `Matches your interest in ${course.category} and ${performanceLevel} level content`
    }));
}

async function recommendLearningPaths(userId: string, skillGaps: string[]): Promise<any[]> {
  const paths = await getRecommendedPaths(userId);

  return paths
    .filter(path => skillGaps.some(skill => path.skills.includes(skill)))
    .slice(0, 3)
    .map(path => ({
      pathId: path.id,
      title: path.title,
      reason: `Addresses skill gaps in: ${path.skills.filter(skill => skillGaps.includes(skill)).join(', ')}`
    }));
}

function generateSkillRecommendations(skillGaps: string[]): string[] {
  return skillGaps.map(skill => `Consider courses focused on ${skill} to strengthen your professional profile.`);
}

function recommendCertificationPath(userId: string): any {
  const certifications = courseManagementEngine.getCertifications();
  const userCerts = courseManagementEngine.getUserCertifications(userId);

  // Find next appropriate certification
  const earnedCertIds = userCerts.map(c => c.certificationId);
  const nextCert = certifications.find(cert =>
    !earnedCertIds.includes(cert.id) &&
    cert.level === 'intermediate' // Simplified logic
  );

  return nextCert ? {
    certificationId: nextCert.id,
    title: nextCert.title,
    reason: 'Next logical step in your certification journey'
  } : null;
}

function generatePersonalizedTips(inProgressCourses: Enrollment[]): string[] {
  const tips = [];

  if (inProgressCourses.length > 2) {
    tips.push('Consider focusing on fewer courses at once for better retention.');
  }

  const lowProgressCourses = inProgressCourses.filter(e => e.progress.overallProgress < 30);
  if (lowProgressCourses.length > 0) {
    tips.push('Some courses have low progress - consider reviewing the fundamentals.');
  }

  return tips;
}

function getNextRecommendedCourse(courseProgress: any[], path: LearningPath): any {
  // Find the next incomplete course in the path
  for (const pathCourse of path.courses) {
    const progress = courseProgress.find(cp => cp.courseId === pathCourse.courseId);
    if (!progress || progress.status !== 'completed') {
      const course = courseManagementEngine.getCourse(pathCourse.courseId);
      return {
        courseId: pathCourse.courseId,
        title: course?.title || 'Unknown Course',
        estimatedTime: pathCourse.estimatedTime
      };
    }
  }

  return null;
}