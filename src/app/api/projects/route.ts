import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo - in production would use database
const tasks: any[] = [];
const resources: any[] = [];
const templates: any[] = [];
const projects: any[] = [];

// Initialize with some sample data
if (tasks.length === 0) {
  tasks.push(
    {
      id: '1',
      title: 'Design System Setup',
      description: 'Create a comprehensive design system with components and tokens',
      status: 'in-progress',
      assignee: 'Alice Johnson',
      priority: 'high',
      dueDate: '2026-05-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'API Documentation',
      description: 'Write comprehensive API documentation for the backend services',
      status: 'todo',
      assignee: 'Bob Smith',
      priority: 'medium',
      dueDate: '2026-05-20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'User Testing',
      description: 'Conduct user testing sessions for the new features',
      status: 'done',
      assignee: 'Carol Davis',
      priority: 'medium',
      dueDate: '2026-04-30',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
}

if (resources.length === 0) {
  resources.push(
    {
      id: '1',
      name: 'Alice Johnson',
      role: 'Senior Designer',
      email: 'alice@example.com',
      capacity: 40,
      allocatedHours: 32,
      availability: 'partially-available',
      currentProjects: ['Design System', 'UI Redesign'],
      skills: ['UI/UX Design', 'Figma', 'Design Systems']
    },
    {
      id: '2',
      name: 'Bob Smith',
      role: 'Backend Developer',
      email: 'bob@example.com',
      capacity: 40,
      allocatedHours: 40,
      availability: 'fully-allocated',
      currentProjects: ['API Development', 'Database Migration'],
      skills: ['Node.js', 'PostgreSQL', 'TypeScript']
    },
    {
      id: '3',
      name: 'Carol Davis',
      role: 'Frontend Developer',
      email: 'carol@example.com',
      capacity: 40,
      allocatedHours: 24,
      availability: 'available',
      currentProjects: ['React Components'],
      skills: ['React', 'TypeScript', 'CSS']
    }
  );
}

if (templates.length === 0) {
  templates.push(
    {
      id: '1',
      name: 'Web Application Development',
      description: 'Complete template for building modern web applications with React and Node.js',
      category: 'software-development',
      estimatedDuration: 12,
      teamSize: 5,
      complexity: 'high',
      tasks: [
        {
          title: 'Project Setup',
          description: 'Initialize project structure and development environment',
          estimatedHours: 16,
          priority: 'high'
        },
        {
          title: 'Database Design',
          description: 'Design and implement database schema',
          estimatedHours: 24,
          priority: 'high'
        },
        {
          title: 'API Development',
          description: 'Build RESTful API endpoints',
          estimatedHours: 80,
          priority: 'high'
        },
        {
          title: 'Frontend Development',
          description: 'Create responsive user interface',
          estimatedHours: 120,
          priority: 'high'
        },
        {
          title: 'Testing',
          description: 'Write unit and integration tests',
          estimatedHours: 40,
          priority: 'medium'
        },
        {
          title: 'Deployment',
          description: 'Configure CI/CD and deploy to production',
          estimatedHours: 16,
          priority: 'medium'
        }
      ],
      milestones: [
        'Project initialized and environment set up',
        'Database schema completed and migrations ready',
        'Core API endpoints implemented and tested',
        'Frontend components developed and integrated',
        'Testing completed with 80%+ coverage',
        'Production deployment successful'
      ],
      requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Testing', 'DevOps']
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Template for building cross-platform mobile applications',
      category: 'mobile-development',
      estimatedDuration: 16,
      teamSize: 4,
      complexity: 'high',
      tasks: [
        {
          title: 'App Architecture Design',
          description: 'Design app architecture and navigation flow',
          estimatedHours: 20,
          priority: 'high'
        },
        {
          title: 'UI/UX Design',
          description: 'Create wireframes and design mockups',
          estimatedHours: 32,
          priority: 'high'
        },
        {
          title: 'Native Development',
          description: 'Implement native iOS and Android features',
          estimatedHours: 100,
          priority: 'high'
        },
        {
          title: 'Cross-platform Integration',
          description: 'Ensure consistent experience across platforms',
          estimatedHours: 40,
          priority: 'medium'
        }
      ],
      milestones: [
        'App architecture finalized',
        'UI/UX designs completed and approved',
        'Core features implemented for both platforms',
        'Cross-platform testing completed',
        'App store submission ready'
      ],
      requiredSkills: ['React Native', 'iOS Development', 'Android Development', 'UI/UX Design']
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'tasks':
        return NextResponse.json({
          success: true,
          data: tasks.filter(t => !tenantId || t.tenantId === tenantId)
        });

      case 'gantt-tasks':
        const ganttTasks = tasks
          .filter(t => !tenantId || t.tenantId === tenantId)
          .map(t => ({
            ...t,
            startDate: t.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: t.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: t.progress || Math.floor(Math.random() * 100)
          }));
        return NextResponse.json({
          success: true,
          data: ganttTasks
        });

      case 'resources':
        return NextResponse.json({
          success: true,
          data: resources.filter(r => !tenantId || r.tenantId === tenantId)
        });

      case 'unassigned-tasks':
        const unassignedTasks = tasks.filter(t =>
          (!t.assignee || t.assignee === '') &&
          (!tenantId || t.tenantId === tenantId)
        );
        return NextResponse.json({
          success: true,
          data: unassignedTasks
        });

      case 'templates':
        return NextResponse.json({
          success: true,
          data: templates.filter(t => !tenantId || t.tenantId === tenantId)
        });

      case 'projects':
        return NextResponse.json({
          success: true,
          data: projects.filter(p => !tenantId || p.tenantId === tenantId)
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tenantId } = body;

    switch (action) {
      case 'create-task':
        const newTask = {
          id: Date.now().toString(),
          ...body,
          tenantId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        tasks.push(newTask);
        return NextResponse.json({
          success: true,
          data: newTask
        });

      case 'create-gantt-task':
        const newGanttTask = {
          id: Date.now().toString(),
          ...body,
          tenantId,
          status: 'todo',
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        tasks.push(newGanttTask);
        return NextResponse.json({
          success: true,
          data: newGanttTask
        });

      case 'create-project-from-template':
        const template = templates.find(t => t.id === body.templateId);
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }

        const newProject = {
          id: Date.now().toString(),
          name: body.name,
          description: body.description,
          templateId: body.templateId,
          startDate: body.startDate,
          status: 'planning',
          tenantId,
          tasks: template.tasks.map((task: any) => ({
            ...task,
            id: Date.now().toString() + Math.random(),
            status: 'todo',
            assignee: null
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        projects.push(newProject);
        return NextResponse.json({
          success: true,
          data: newProject
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Projects API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tenantId } = body;

    switch (action) {
      case 'update-task-status':
        const taskIndex = tasks.findIndex(t => t.id === body.taskId);
        if (taskIndex === -1) {
          return NextResponse.json(
            { error: 'Task not found' },
            { status: 404 }
          );
        }
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          status: body.status,
          updatedAt: new Date().toISOString()
        };
        return NextResponse.json({
          success: true,
          data: tasks[taskIndex]
        });

      case 'update-task-progress':
        const progressTaskIndex = tasks.findIndex(t => t.id === body.taskId);
        if (progressTaskIndex === -1) {
          return NextResponse.json(
            { error: 'Task not found' },
            { status: 404 }
          );
        }
        tasks[progressTaskIndex] = {
          ...tasks[progressTaskIndex],
          progress: body.progress,
          updatedAt: new Date().toISOString()
        };
        return NextResponse.json({
          success: true,
          data: tasks[progressTaskIndex]
        });

      case 'assign-resource':
        const taskToAssign = tasks.find(t => t.id === body.taskId);
        const resource = resources.find(r => r.id === body.resourceId);

        if (!taskToAssign || !resource) {
          return NextResponse.json(
            { error: 'Task or resource not found' },
            { status: 404 }
          );
        }

        // Update task assignee
        const assignTaskIndex = tasks.findIndex(t => t.id === body.taskId);
        tasks[assignTaskIndex] = {
          ...tasks[assignTaskIndex],
          assignee: resource.name,
          updatedAt: new Date().toISOString()
        };

        // Update resource allocation
        const resourceIndex = resources.findIndex(r => r.id === body.resourceId);
        resources[resourceIndex] = {
          ...resources[resourceIndex],
          allocatedHours: Math.min(resources[resourceIndex].capacity,
            resources[resourceIndex].allocatedHours + (taskToAssign.estimatedHours || 8)),
          currentProjects: [...resources[resourceIndex].currentProjects, taskToAssign.title]
        };

        return NextResponse.json({
          success: true,
          data: { task: tasks[assignTaskIndex], resource: resources[resourceIndex] }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Projects API PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}