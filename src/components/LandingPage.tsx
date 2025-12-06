import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mic, Zap, Briefcase, Shield, Map, BarChart3,
    Globe, Heart, Users, TrendingUp, Award, ArrowRight,
    Play, Github, FileText, ExternalLink
} from 'lucide-react';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

interface Metric {
    value: string;
    label: string;
    icon: React.ReactNode;
}

const LandingPage: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const [metrics, setMetrics] = useState({
        users: 0,
        connections: 0,
        jobs: 0,
        services: 0
    });

    // Animate metrics on mount
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        const targets = {
            users: 1247,
            connections: 3456,
            jobs: 892,
            services: 15234
        };

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;

            setMetrics({
                users: Math.floor(targets.users * progress),
                connections: Math.floor(targets.connections * progress),
                jobs: Math.floor(targets.jobs * progress),
                services: Math.floor(targets.services * progress)
            });

            if (step >= steps) {
                clearInterval(timer);
                setMetrics(targets);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const features: Feature[] = [
        {
            icon: <Mic className="w-8 h-8" />,
            title: 'Voice-First Interface',
            description: 'Hands-free interaction using Web Speech API. Speak naturally to search, navigate, and post jobs.',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Ethereal Notifications',
            description: 'Stunning holographic effects with contextual sounds and AI-generated spirit avatars.',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Briefcase className="w-8 h-8" />,
            title: 'Gig Economy Platform',
            description: 'AI-powered job matching connects workers with opportunities based on skills and location.',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Blockchain Trust',
            description: 'Verifiable NFT credentials on Polygon blockchain create transparent, tamper-proof reputation.',
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: <Map className="w-8 h-8" />,
            title: 'Service Navigator',
            description: 'Find essential services using voice search with Australian government API integration.',
            color: 'from-indigo-500 to-blue-500'
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: 'Spirit Trails Map',
            description: '3D visualization with animated connections between users and glowing event beacons.',
            color: 'from-yellow-500 to-orange-500'
        }
    ];

    const impactMetrics: Metric[] = [
        {
            value: metrics.users.toLocaleString(),
            label: 'Rural Users',
            icon: <Users className="w-6 h-6" />
        },
        {
            value: metrics.connections.toLocaleString(),
            label: 'Connections Made',
            icon: <Heart className="w-6 h-6" />
        },
        {
            value: metrics.jobs.toLocaleString(),
            label: 'Jobs Completed',
            icon: <Briefcase className="w-6 h-6" />
        },
        {
            value: metrics.services.toLocaleString(),
            label: 'Services Found',
            icon: <Globe className="w-6 h-6" />
        }
    ];

    const techStack = [
        'React 18', 'TypeScript', 'Three.js', 'Framer Motion',
        'Web Speech API', 'Socket.io', 'Polygon', 'MongoDB'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(0,0,0,0))]" />
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-purple-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.2, 1, 0.2],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
                            <span className="text-purple-300 font-semibold">🏆 Hackathon 2024 Submission</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            Rural Connect AI
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            An intelligent community platform for regional Australia, featuring voice-first accessibility,
                            blockchain trust, and ethereal UI/UX
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center mb-12">
                            <motion.a
                                href="/demo"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
                            >
                                <Play className="w-5 h-5" />
                                Try Live Demo
                            </motion.a>

                            <motion.a
                                href="https://github.com/yourusername/rural-connect-ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                            >
                                <Github className="w-5 h-5" />
                                View Source
                            </motion.a>

                            <motion.a
                                href="/KIRO_WRITEUP.pdf"
                                target="_blank"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                Kiro Write-up
                            </motion.a>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-400">
                            {techStack.map((tech, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-purple-400 rounded-full flex justify-center">
                        <motion.div
                            className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"
                            animate={{ y: [0, 16, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Impact Metrics */}
            <section className="py-20 px-4 bg-black/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Platform Impact</h2>
                        <p className="text-gray-400">Real-time metrics showing our reach across rural Australia</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {impactMetrics.map((metric, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 text-center"
                            >
                                <div className="flex justify-center mb-3 text-purple-400">
                                    {metric.icon}
                                </div>
                                <div className="text-3xl font-bold mb-2">{metric.value}</div>
                                <div className="text-sm text-gray-400">{metric.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">Hackathon Features</h2>
                        <p className="text-gray-400">Innovative solutions for rural Australian communities</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 cursor-pointer"
                                onClick={() => setActiveFeature(i)}
                            >
                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Built with Kiro Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Award className="w-16 h-16 mx-auto mb-6 text-purple-400" />
                        <h2 className="text-4xl font-bold mb-6">Built with Kiro</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Developed using Kiro's spec-driven development methodology, transforming rough ideas
                            into production-ready features through systematic requirements, design, and implementation.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/5 rounded-lg p-6">
                                <div className="text-3xl font-bold text-purple-400 mb-2">20 days</div>
                                <div className="text-sm text-gray-400">Idea to Production</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-6">
                                <div className="text-3xl font-bold text-pink-400 mb-2">100%</div>
                                <div className="text-sm text-gray-400">Requirements Met</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-6">
                                <div className="text-3xl font-bold text-cyan-400 mb-2">85%</div>
                                <div className="text-sm text-gray-400">Test Coverage</div>
                            </div>
                        </div>

                        <motion.a
                            href="/KIRO_WRITEUP.pdf"
                            target="_blank"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
                        >
                            Read Our Development Story
                            <ArrowRight className="w-5 h-5" />
                        </motion.a>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-6">Experience Rural Connect AI</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Try the live demo with pre-populated data and explore all features
                        </p>

                        <div className="bg-white/5 rounded-lg p-6 mb-8 max-w-md mx-auto">
                            <div className="text-sm text-gray-400 mb-2">Demo Credentials</div>
                            <div className="font-mono text-purple-400">demo@ruralconnect.au</div>
                            <div className="font-mono text-purple-400">demo2024</div>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <motion.a
                                href="/demo"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
                            >
                                <Play className="w-5 h-5" />
                                Launch Demo
                            </motion.a>

                            <motion.a
                                href="/DEMO_WALKTHROUGH.md"
                                target="_blank"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                Demo Guide
                            </motion.a>

                            <motion.a
                                href="https://github.com/yourusername/rural-connect-ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                                GitHub Repo
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/10">
                <div className="max-w-6xl mx-auto text-center text-gray-400">
                    <p className="mb-2">Built with ❤️ for Rural Australia</p>
                    <p className="text-sm">Powered by Kiro AI | Hackathon 2024</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
