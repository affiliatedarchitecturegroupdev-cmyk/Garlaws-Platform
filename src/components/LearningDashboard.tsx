'use client';

import React, { useState, useEffect } from 'react';
import { Course, ModuleContent, Enrollment, CourseProgress } from '@/lib/course-management-engine';

interface LearningDashboardProps {
  userId: string;
}

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHoursLearned: number;
  certificatesEarned: number;
  currentStreak: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline?: Date;
  category: 'courses' | 'hours' | 'certificates' | 'streak';
}

export function LearningDashboard({ userId }: LearningDashboardProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user enrollments
      const enrollmentsResponse = await fetch('/api/academy/enrollments?userId=' + userId);
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        setEnrollments(enrollmentsData.data || []);
      }

      // Load learning statistics
      const statsResponse = await fetch('/api/academy/stats?userId=' + userId);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Load learning goals
      const goalsResponse = await fetch('/api/academy/goals?userId=' + userId);
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.data || []);
      }

      // Load personalized recommendations
      const recsResponse = await fetch('/api/academy/learning-paths?action=generate_recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (recsResponse.ok) {
        const recsData = await recsResponse.json();
        setRecommendations(recsData.data || {});
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const continueLearning = (enrollment: Enrollment) => {
    // Navigate to course player
    window.location.href = `/academy/course/${enrollment.courseId}?enrollmentId=${enrollment.id}`;
  };

  const viewCertificate = (enrollment: Enrollment) => {
    if (enrollment.certificateEarned && enrollment.certificateUrl) {
      window.open(enrollment.certificateUrl, '_blank');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 30) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span>;
      case 'enrolled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Not Started</span>;
      case 'dropped':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Dropped</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeCourses = enrollments.filter(e => e.status === 'in_progress' || e.status === 'enrolled');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back to Garlaws Academy!</h1>
        <p className="text-blue-100">Continue your learning journey and unlock new opportunities.</p>
      </div>

      {/* Learning Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedCourses}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hours Learned</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalHoursLearned}</p>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates Earned</p>
                <p className="text-2xl font-bold text-purple-600">{stats.certificatesEarned}</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Professional credentials</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Streak</p>
                <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Days in a row</p>
          </div>
        </div>
      )}

      {/* Continue Learning Section */}
      {activeCourses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
          <div className="space-y-4">
            {activeCourses.slice(0, 3).map(enrollment => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">Course Title</h3> {/* Would fetch actual course title */}
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(enrollment.progress.overallProgress)}`}
                        style={{ width: `${enrollment.progress.overallProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{enrollment.progress.overallProgress}%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {enrollment.progress.timeSpent} minutes studied • Last accessed: {new Date(enrollment.lastAccessedAt || enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => continueLearning(enrollment)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      {stats && stats.achievements.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.achievements.slice(0, 6).map(achievement => (
              <div key={achievement.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="text-3xl mr-3">{achievement.icon}</div>
                <div>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Goals */}
      {goals.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Learning Goals</h2>
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  {goal.deadline && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div
                      className={`h-2 rounded-full ${goal.current >= goal.target ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {goal.current} / {goal.target} {goal.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && Object.keys(recommendations).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>

          {/* Next Courses */}
          {recommendations && (recommendations as any).nextCourses && (recommendations as any).nextCourses.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Next Courses to Consider</h3>
              <div className="space-y-2">
                {(recommendations as any).nextCourses.slice(0, 3).map((course: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{course.title}</span>
                      <p className="text-sm text-gray-600">{course.reason}</p>
                    </div>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                      Enroll
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Paths */}
          {recommendations && (recommendations as any).learningPaths && (recommendations as any).learningPaths.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Recommended Learning Paths</h3>
              <div className="space-y-2">
                {(recommendations as any).learningPaths.slice(0, 2).map((path: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <div>
                      <span className="font-medium">{path.title}</span>
                      <p className="text-sm text-gray-600">{path.reason}</p>
                    </div>
                    <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">
                      Explore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certification Path */}
          {recommendations && (recommendations as any).certificationPath && (
            <div>
              <h3 className="font-medium mb-3">Certification Opportunity</h3>
              <div className="p-3 bg-green-50 rounded">
                <span className="font-medium">{(recommendations as any).certificationPath.title}</span>
                <p className="text-sm text-gray-600 mt-1">{(recommendations as any).certificationPath.reason}</p>
                <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  Learn More
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {enrollments.slice(0, 5).map(enrollment => (
            <div key={enrollment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm">
                    {enrollment.status === 'completed' ? 'Completed' : 'Started'} course module
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(enrollment.lastAccessedAt || enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(enrollment.status)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}