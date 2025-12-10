/**
 * Project Details Card Component
 * Displays project information in an interactive card format with hover effects
 * Shows Problem, Role, Stack, and Outcome in an expandable grid
 */

import { parseProjectDescription } from '@/lib/parsing';

interface ProjectDetailsCardProps {
  /** Project description in format "Problem: ... | Role: ... | Stack: ... | Outcome: ..." */
  description: string;
}

/**
 * Creative Project Details Component
 * Displays Problem, Role, Stack, and Outcome in an interactive grid
 */
export default function ProjectDetailsCard({ description }: ProjectDetailsCardProps) {
  const details = parseProjectDescription(description);
  
  const sections = [
    { key: 'problem', label: 'Problem', icon: '🎯', color: 'from-red-500 to-red-600' },
    { key: 'role', label: 'Role', icon: '👤', color: 'from-blue-500 to-blue-600' },
    { key: 'stack', label: 'Stack', icon: '⚙️', color: 'from-green-500 to-green-600' },
    { key: 'outcome', label: 'Outcome', icon: '🚀', color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {sections.map((section, index) => (
        <div key={section.key} className="group">
          <div
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 min-h-24 flex flex-col items-center justify-center transition-all duration-300 group-hover:border-gray-600/70 cursor-pointer overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
              {section.icon}
            </div>
            <h3 className="text-white font-medium text-sm text-center">
              {section.label}
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed mt-2 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-300 text-center">
              {details[section.key] || 'Not specified'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

