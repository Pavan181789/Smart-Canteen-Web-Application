/**
 * Professional Sidebar Navigation Component
 * Glassmorphism design with smooth animations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Monitor,
  TrendingUp,
  AlertTriangle,
  Download
} from 'lucide-react';

const Sidebar = ({ activeItem, onItemChange, isCollapsed, onToggleCollapse }) => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Main monitoring overview'
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Monitor,
      description: 'Real-time system status'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Generate reports'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      description: 'System notifications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration'
    }
  ];

  const sidebarVariants = {
    expanded: {
      width: '280px',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    collapsed: {
      width: '80px',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className="glass-card border-r border-glass-border h-screen sticky top-0 left-0 z-40 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo and Toggle */}
      <div className="p-6 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  variants={itemVariants}
                  animate="expanded"
                  exit="collapsed"
                  className="flex flex-col"
                >
                  <span className="font-bold text-lg gradient-text">Monitor</span>
                  <span className="text-xs text-gray-400">Cloud System</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-dark-surface/50 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onItemChange(item.id)}
              className={`sidebar-item w-full group ${
                isActive ? 'active' : 'text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-dark-surface/50 group-hover:bg-dark-surface/70'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={itemVariants}
                      animate="expanded"
                      exit="collapsed"
                      className="flex-1 text-left"
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-glass-border space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="sidebar-item w-full text-gray-400 hover:text-white"
        >
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span variants={itemVariants} animate="expanded" exit="collapsed">
                  Export
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="sidebar-item w-full text-gray-400 hover:text-white"
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span variants={itemVariants} animate="expanded" exit="collapsed">
                  Statistics
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
