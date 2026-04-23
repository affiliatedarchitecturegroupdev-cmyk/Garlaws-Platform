'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Palette, MousePointer, Eye, Zap, Sparkles, Layers, Wand2, Settings, Play, Pause, RotateCcw, Download } from 'lucide-react'

// Types for UX Enhancement
interface UXComponent {
  id: string
  name: string
  type: 'animation' | 'interaction' | 'layout' | 'feedback' | 'navigation'
  category: string
  description: string
  preview: string
  properties: Record<string, any>
  usage: number
  rating: number
}

interface AnimationPreset {
  id: string
  name: string
  type: 'entrance' | 'exit' | 'hover' | 'focus' | 'loading'
  duration: number
  easing: string
  keyframes: any[]
  tags: string[]
}

interface InteractionPattern {
  id: string
  name: string
  type: 'gesture' | 'hover' | 'click' | 'drag' | 'swipe'
  description: string
  triggers: string[]
  actions: string[]
  accessibility: {
    keyboard: boolean
    screenReader: boolean
    touch: boolean
  }
}

interface ThemeConfiguration {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  typography: {
    fontFamily: string
    fontSize: Record<string, string>
    fontWeight: Record<string, string>
    lineHeight: Record<string, string>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  animations: Record<string, any>
}

interface UXMetrics {
  totalComponents: number
  activeAnimations: number
  userInteractions: number
  performanceScore: number
  accessibilityScore: number
  userSatisfaction: number
}

export default function UXEnhancement() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample UX components
  const [uxComponents] = useState<UXComponent[]>([
    {
      id: 'comp-001',
      name: 'Magnetic Button',
      type: 'interaction',
      category: 'Buttons',
      description: 'Interactive button with magnetic cursor attraction',
      preview: '🧲',
      properties: {
        attraction: 0.3,
        friction: 0.8,
        size: 'md',
        variant: 'primary'
      },
      usage: 1250,
      rating: 4.8
    },
    {
      id: 'comp-002',
      name: 'Morphing Card',
      type: 'animation',
      category: 'Cards',
      description: 'Shape-shifting card with smooth transitions',
      preview: '🔄',
      properties: {
        duration: 300,
        easing: 'ease-out',
        morphTargets: ['square', 'circle', 'hexagon']
      },
      usage: 890,
      rating: 4.6
    },
    {
      id: 'comp-003',
      name: 'Particle Background',
      type: 'layout',
      category: 'Backgrounds',
      description: 'Animated particle system background',
      preview: '✨',
      properties: {
        particleCount: 50,
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        speed: 'medium'
      },
      usage: 654,
      rating: 4.7
    },
    {
      id: 'comp-004',
      name: 'Floating Elements',
      type: 'interaction',
      category: 'Layout',
      description: 'Elements that float and follow mouse movement',
      preview: '🏊',
      properties: {
        floatRange: 20,
        speed: 0.5,
        direction: 'circular'
      },
      usage: 432,
      rating: 4.5
    },
    {
      id: 'comp-005',
      name: 'Glass Morphism Panel',
      type: 'layout',
      category: 'Containers',
      description: 'Frosted glass effect with backdrop blur',
      preview: '🪟',
      properties: {
        blur: 10,
        opacity: 0.8,
        borderRadius: 16
      },
      usage: 987,
      rating: 4.9
    }
  ])

  // Sample animation presets
  const [animationPresets] = useState<AnimationPreset[]>([
    {
      id: 'anim-001',
      name: 'Fade In Up',
      type: 'entrance',
      duration: 500,
      easing: 'ease-out',
      keyframes: [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      tags: ['entrance', 'smooth', 'popular']
    },
    {
      id: 'anim-002',
      name: 'Bounce In',
      type: 'entrance',
      duration: 800,
      easing: 'ease-out',
      keyframes: [
        { opacity: 0, transform: 'scale(0.3)' },
        { opacity: 1, transform: 'scale(1)' }
      ],
      tags: ['entrance', 'playful', 'attention']
    },
    {
      id: 'anim-003',
      name: 'Slide In Left',
      type: 'entrance',
      duration: 400,
      easing: 'ease-out',
      keyframes: [
        { opacity: 0, transform: 'translateX(-100%)' },
        { opacity: 1, transform: 'translateX(0)' }
      ],
      tags: ['entrance', 'directional', 'subtle']
    },
    {
      id: 'anim-004',
      name: 'Pulse',
      type: 'hover',
      duration: 1000,
      easing: 'ease-in-out',
      keyframes: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' },
        { transform: 'scale(1)' }
      ],
      tags: ['hover', 'attention', 'subtle']
    }
  ])

  // Sample interaction patterns
  const [interactionPatterns] = useState<InteractionPattern[]>([
    {
      id: 'int-001',
      name: 'Magnetic Attraction',
      type: 'hover',
      description: 'Elements attract cursor with smooth physics',
      triggers: ['mouseenter', 'mousemove'],
      actions: ['translate', 'scale'],
      accessibility: {
        keyboard: true,
        screenReader: false,
        touch: true
      }
    },
    {
      id: 'int-002',
      name: 'Swipe Navigation',
      type: 'gesture',
      description: 'Touch/swipe gestures for navigation',
      triggers: ['touchstart', 'touchmove', 'touchend'],
      actions: ['navigate', 'scroll'],
      accessibility: {
        keyboard: true,
        screenReader: true,
        touch: true
      }
    },
    {
      id: 'int-003',
      name: 'Progressive Disclosure',
      type: 'click',
      description: 'Content revealed gradually on interaction',
      triggers: ['click', 'hover'],
      actions: ['expand', 'reveal'],
      accessibility: {
        keyboard: true,
        screenReader: true,
        touch: true
      }
    }
  ])

  // Sample theme configurations
  const [themeConfigurations] = useState<ThemeConfiguration[]>([
    {
      id: 'theme-001',
      name: 'Modern Glass',
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: 'rgba(255, 255, 255, 0.8)',
        surface: 'rgba(255, 255, 255, 0.9)',
        text: '#111827'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
        fontWeight: { normal: '400', medium: '500', bold: '700' },
        lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' }
      },
      spacing: { 1: '0.25rem', 2: '0.5rem', 4: '1rem', 8: '2rem' },
      borderRadius: { sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem' },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      },
      animations: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideUp: 'slideUp 0.4s ease-out'
      }
    }
  ])

  const [uxMetrics] = useState<UXMetrics>({
    totalComponents: 156,
    activeAnimations: 42,
    userInteractions: 8924,
    performanceScore: 94.2,
    accessibilityScore: 96.8,
    userSatisfaction: 4.7
  })

  const [selectedComponent, setSelectedComponent] = useState<UXComponent | null>(null)
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationPreset | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeConfiguration>(themeConfigurations[0])

  // Calculate derived metrics
  const componentStats = useMemo(() => {
    const byType = uxComponents.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byCategory = uxComponents.reduce((acc, comp) => {
      acc[comp.category] = (acc[comp.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgRating = uxComponents.reduce((sum, comp) => sum + comp.rating, 0) / uxComponents.length

    return { byType, byCategory, avgRating }
  }, [uxComponents])

  // Canvas rendering for preview
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isPreviewMode) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw preview elements
    ctx.fillStyle = currentTheme.colors.primary
    ctx.fillRect(50, 50, 200, 100)

    ctx.fillStyle = currentTheme.colors.text
    ctx.font = '16px ' + currentTheme.typography.fontFamily
    ctx.fillText('UX Preview Mode', 60, 80)
    ctx.fillText('Interactive Elements', 60, 100)
  }, [isPreviewMode, currentTheme])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">UX Enhancement Platform</h1>
              <p className="text-lg opacity-90">
                Advanced user experience features with interactive elements and modern design patterns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Components</p>
              <p className="text-2xl font-bold text-gray-900">{uxMetrics.totalComponents}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Available for use</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active Animations</p>
              <p className="text-2xl font-bold text-gray-900">{uxMetrics.activeAnimations}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Running smoothly</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Performance Score</p>
              <p className="text-2xl font-bold text-gray-900">{uxMetrics.performanceScore}%</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Optimized</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">User Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{uxMetrics.userSatisfaction}/5</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Highly rated</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Library */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Library</h3>
          <div className="space-y-3">
            {uxComponents.map(component => (
              <div
                key={component.id}
                onClick={() => setSelectedComponent(component)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedComponent?.id === component.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{component.preview}</span>
                    <span className="font-medium text-gray-900">{component.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    component.type === 'animation' ? 'bg-blue-100 text-blue-800' :
                    component.type === 'interaction' ? 'bg-green-100 text-green-800' :
                    component.type === 'layout' ? 'bg-purple-100 text-purple-800' :
                    component.type === 'feedback' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {component.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Used {component.usage} times</span>
                  <span>⭐ {component.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Interactive Preview</h3>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <Play className="w-4 h-4 text-green-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Pause className="w-4 h-4 text-yellow-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <RotateCcw className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full h-64 bg-gray-50"
            />
          </div>

          {isPreviewMode && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                🎨 Preview mode active - Interactive elements are now live.
                Try hovering and clicking on components to see animations and interactions.
              </p>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedComponent ? 'Component Properties' : 'Animation Library'}
          </h3>

          {selectedComponent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Component</label>
                <div className="font-medium text-gray-900">{selectedComponent.name}</div>
                <div className="text-sm text-gray-600">{selectedComponent.category}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Properties</label>
                <div className="space-y-2">
                  {Object.entries(selectedComponent.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                  Apply to Project
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {animationPresets.slice(0, 5).map(animation => (
                <div
                  key={animation.id}
                  onClick={() => setSelectedAnimation(animation)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnimation?.id === animation.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{animation.name}</div>
                  <div className="text-sm text-gray-600">{animation.type} • {animation.duration}ms</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {animation.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Animation Library */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Animation Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {animationPresets.map(animation => (
            <div key={animation.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{animation.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  animation.type === 'entrance' ? 'bg-green-100 text-green-800' :
                  animation.type === 'exit' ? 'bg-red-100 text-red-800' :
                  animation.type === 'hover' ? 'bg-blue-100 text-blue-800' :
                  animation.type === 'focus' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {animation.type}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{animation.duration}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Easing:</span>
                  <span className="font-medium">{animation.easing}</span>
                </div>
              </div>

              <div className="mt-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                  Preview Animation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interaction Patterns */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {interactionPatterns.map(pattern => (
            <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pattern.type === 'gesture' ? 'bg-blue-100 text-blue-800' :
                  pattern.type === 'hover' ? 'bg-green-100 text-green-800' :
                  pattern.type === 'click' ? 'bg-purple-100 text-purple-800' :
                  pattern.type === 'drag' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pattern.type}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Triggers:</span>
                  <div className="flex flex-wrap gap-1">
                    {pattern.triggers.map(trigger => (
                      <span key={trigger} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Actions:</span>
                  <div className="flex flex-wrap gap-1">
                    {pattern.actions.map(action => (
                      <span key={action} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${pattern.accessibility.keyboard ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Keyboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${pattern.accessibility.screenReader ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Screen Reader</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${pattern.accessibility.touch ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Touch</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}