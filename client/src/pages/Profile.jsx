import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, updateProfile, uploadProfilePicture } from '../services/profileService';
import { getCurrentUser } from '../services/authService';
import { Pencil, ShieldCheck, HeartPulse, Lock, Scale, Briefcase, Camera } from 'lucide-react';

const Profile = () => {
    const { id } = useParams(); // Get ID from URL if present
    const [activeTab, setActiveTab] = useState('resume');
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const currentUser = getCurrentUser();
    const fileInputRef = React.useRef(null);

    // If ID is in URL, fetch that user. Otherwise fetch 'me'.
    const targetUserId = id || 'me';

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const result = await uploadProfilePicture(targetUserId, file);
            setProfile(prev => ({ ...prev, profilePicture: result.url }));
            alert('Profile picture updated!');
        } catch (error) {
            console.error('Failed to upload image', error);
            alert('Failed to upload image');
        }
    };

    // Default Salary Configuration
    const initialSalaryConfig = {
        basicPercent: 50,
        hraPercentOfBasic: 50,
        standardAllowance: 4167,
        performanceBonusPercent: 8.33,
        ltaPercent: 8.33,
        pfRate: 12,
        professionalTax: 200
    };

    const [salaryConfig, setSalaryConfig] = useState(initialSalaryConfig);
    const [calculatedSalary, setCalculatedSalary] = useState({});
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [targetUserId]);

    useEffect(() => {
        if (profile.salaryDetails?.monthlyWage) {
            calculateSalaryComponents(profile.salaryDetails.monthlyWage, salaryConfig);
        }
    }, [profile.salaryDetails?.monthlyWage, salaryConfig]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile(targetUserId);

            // Ensure array fields initialized
            if (!data.skills) data.skills = [];
            if (!data.certifications) data.certifications = [];
            if (!data.interests) data.interests = [];
            if (!data.salaryDetails) data.salaryDetails = {};

            if (data.salaryDetails.config) {
                setSalaryConfig({ ...initialSalaryConfig, ...data.salaryDetails.config });
            } else {
                setSalaryConfig(initialSalaryConfig);
            }

            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSalaryComponents = (wage, config) => {
        const monthlyWage = parseFloat(wage) || 0;

        const basic = Math.round(monthlyWage * (config.basicPercent / 100));
        const hra = Math.round(basic * (config.hraPercentOfBasic / 100));
        const stdAlloc = parseFloat(config.standardAllowance) || 0;
        const perfBonus = Math.round(monthlyWage * (config.performanceBonusPercent / 100));
        const lta = Math.round(monthlyWage * (config.ltaPercent / 100));

        const totalAllocated = basic + hra + stdAlloc + perfBonus + lta;
        const fixedAllowance = monthlyWage - totalAllocated;

        if (fixedAllowance < 0) {
            setValidationError('Total components exceed the Monthly Wage.');
        } else {
            setValidationError('');
        }

        const pf = Math.round(basic * (config.pfRate / 100));
        const pt = parseFloat(config.professionalTax) || 0;

        setCalculatedSalary({
            basic,
            hra,
            stdAlloc,
            perfBonus,
            lta,
            fixedAllowance: fixedAllowance > 0 ? fixedAllowance : 0,
            pf,
            pt,
            totalDeductions: pf + pt,
            netSalary: monthlyWage - (pf + pt)
        });
    };

    const handleChange = (field, value) => {
        setProfile({ ...profile, [field]: value });
    };

    const handleDeepChange = (parent, field, value) => {
        setProfile({
            ...profile,
            [parent]: {
                ...profile[parent],
                [field]: value
            }
        });
    };

    const handleSalaryConfigChange = (field, value) => {
        setSalaryConfig(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    // Safe Array Operations
    const handleArrayChange = (field, index, value) => {
        const currentArray = Array.isArray(profile[field]) ? profile[field] : [];
        const newArray = [...currentArray];
        newArray[index] = value;
        setProfile({ ...profile, [field]: newArray });
    };

    const addArrayItem = (field) => {
        const currentArray = Array.isArray(profile[field]) ? profile[field] : [];
        setProfile({ ...profile, [field]: [...currentArray, ""] });
    };

    const removeArrayItem = (field, index) => {
        const currentArray = Array.isArray(profile[field]) ? profile[field] : [];
        const newArray = [...currentArray];
        newArray.splice(index, 1);
        setProfile({ ...profile, [field]: newArray });
    };

    const saveProfile = async () => {
        try {
            const updatedProfile = {
                ...profile,
                salaryDetails: {
                    ...profile.salaryDetails,
                    config: salaryConfig,
                    computed: calculatedSalary
                }
            };

            if (!Array.isArray(updatedProfile.skills)) updatedProfile.skills = [];
            if (!Array.isArray(updatedProfile.certifications)) updatedProfile.certifications = [];

            await updateProfile(targetUserId, updatedProfile);
            setIsEditing(false);
            alert('Profile updated successfully!');
            fetchProfile();
        } catch (error) {
            console.error('Failed to update profile', error);
            alert(`Failed to update profile: ${error.response?.data?.message || error.message}`);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

    // Permissions: Admin OR HR can edit salary. Employee cannot.
    const canEditSalary = currentUser?.role === 'Admin' || currentUser?.role === 'HR';
    const showSalaryTab = true;

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">

            <div className="max-w-6xl mx-auto p-6">
            {/* Profile Header Card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 mb-8 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/40">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50/80 to-white">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {id ? `${profile.name || 'Employee'}'s Profile` : 'My Profile'}
                        </h2>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all font-medium text-sm shadow-sm"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="space-x-3">
                                <button type="button" onClick={saveProfile} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md shadow-green-200 transition-all font-medium text-sm">Save Changes</button>
                                <button type="button" onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-all font-medium text-sm">Cancel</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center justify-center md:col-span-1">
                            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center relative mb-4 shadow-sm border-4 border-white overflow-hidden">
                                {profile.profilePicture ? (
                                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Pencil className="h-10 w-10 text-gray-400" />
                                )}
                                
                                {isEditing && (
                                    <>
                                        <div 
                                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full border shadow cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera size={16} className="text-gray-600" />
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </>
                                )}
                            </div>
                            <div className="w-full text-center">
                                <input
                                    disabled={!isEditing}
                                    value={profile.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="text-2xl font-bold text-center w-full border-b border-transparent focus:border-gray-300 outline-none bg-transparent"
                                    placeholder="My Name"
                                />
                                <input
                                    disabled={!isEditing}
                                    value={profile.jobPosition || ''}
                                    onChange={(e) => handleChange('jobPosition', e.target.value)}
                                    className="text-md text-gray-500 text-center w-full border-b border-transparent focus:border-gray-300 outline-none bg-transparent mt-2"
                                    placeholder="Job Position"
                                />
                            </div>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                            <div className="group">
                                <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Login ID</span>
                                <div className="font-medium text-slate-700 bg-slate-50/50 rounded-lg px-3 py-2 border border-transparent">
                                    {profile.employeeId || 'N/A'}
                                </div>
                            </div>
                            
                            <div className="group">
                                <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Company</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.companyName || ''}
                                    onChange={(e) => handleChange('companyName', e.target.value)}
                                    className={`font-medium text-slate-800 w-full rounded-lg px-3 py-2 outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border border-transparent'}`}
                                    placeholder="Company Name"
                                />
                            </div>

                            <div className="group">
                                <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Email</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className={`font-medium text-slate-800 w-full rounded-lg px-3 py-2 outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border border-transparent'}`}
                                    placeholder="Email"
                                />
                            </div>
                            
                            <div className="group">
                                <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Department</span>
                                <input
                                    disabled={!isEditing || !canEditSalary} // Admin/HR only
                                    value={profile.department || ''}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    className={`font-medium text-slate-800 w-full rounded-lg px-3 py-2 outline-none transition-all ${isEditing && canEditSalary ? 'bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border border-transparent'}`}
                                    placeholder="-"
                                />
                            </div>

                            <div className="group">
                                <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Mobile</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className={`font-medium text-slate-800 w-full rounded-lg px-3 py-2 outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border border-transparent'}`}
                                    placeholder="-"
                                />
                            </div>
                            
                            <div className="group">
                                <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Manager</span>
                                <input
                                    disabled={!isEditing || !canEditSalary}
                                    value={profile.manager || ''}
                                    onChange={(e) => handleChange('manager', e.target.value)}
                                    className={`font-medium text-slate-800 w-full rounded-lg px-3 py-2 outline-none transition-all ${isEditing && canEditSalary ? 'bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border border-transparent'}`}
                                    placeholder="-"
                                />
                            </div>

                            <div className="group">
                                <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Location</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.location || ''}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    className={`font-medium text-slate-800 w-full rounded-lg px-3 py-2 outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border border-transparent'}`}
                                    placeholder="-"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-8 border-b border-slate-100 overflow-x-auto gap-6">
                        {['Resume', 'Private Info', 'Salary Info', 'Security'].map(tab => {
                            const tabKey = tab.toLowerCase().replace(' ', '');
                            const realKey = tab === 'Salary Info' ? 'salary' : tab === 'Private Info' ? 'private' : tab.toLowerCase();

                            if (realKey === 'salary' && !showSalaryTab) return null;

                            return (
                                <button
                                    key={realKey}
                                    onClick={() => setActiveTab(realKey)}
                                    className={`py-4 px-1 font-medium border-b-2 transition-all duration-200 whitespace-nowrap text-sm tracking-wide ${activeTab === realKey ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {activeTab === 'resume' && (
                        <>
                            {/* Left Column: About, Interests */}
                                    <div className="md:col-span-1 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-slate-800 tracking-tight">About</h3>
                                    </div>
                                    <div className="flex-grow">
                                        <textarea
                                            disabled={!isEditing}
                                            value={profile.about || ''}
                                            onChange={(e) => handleChange('about', e.target.value)}
                                            className={`w-full h-32 text-sm text-slate-600 resize-none outline-none border rounded-xl p-3 bg-slate-50/50 transition-all ${isEditing ? 'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'border-transparent'}`}
                                            placeholder="Write a brief description about yourself..."
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="font-bold text-slate-800 tracking-tight mb-3">Interests & Hobbies</h3>
                                        <textarea
                                            disabled={!isEditing}
                                            value={profile.interests || ''}
                                            onChange={(e) => handleChange('interests', e.target.value)}
                                            className={`w-full h-24 text-sm text-slate-600 resize-none outline-none border rounded-xl p-3 bg-slate-50/50 transition-all ${isEditing ? 'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'border-transparent'}`}
                                            placeholder="Sharing your interests helps colleagues get to know you better..."
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="font-bold text-slate-800 tracking-tight mb-3">What I Love About My Job</h3>
                                        <textarea
                                            disabled={!isEditing}
                                            value={profile.loveJob || ''}
                                            onChange={(e) => handleChange('loveJob', e.target.value)}
                                            className={`w-full h-24 text-sm text-slate-600 resize-none outline-none border rounded-xl p-3 bg-slate-50/50 transition-all ${isEditing ? 'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'border-transparent'}`}
                                            placeholder="Share what motivates you..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Skills, Certification */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
                                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Skills</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Array.isArray(profile.skills) && profile.skills.map((skill, index) => (
                                            <div key={index} className="flex gap-2 items-center group">
                                                <input
                                                    disabled={!isEditing}
                                                    value={skill}
                                                    onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                                                    className={`border-0 bg-slate-50 rounded-lg p-3 text-sm w-full outline-none font-medium text-slate-700 transition-all ${isEditing ? 'hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 shadow-sm' : ''}`}
                                                    placeholder="Skill name"
                                                />
                                                {isEditing && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeArrayItem('skills', index)} 
                                                        className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        x
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {isEditing && (
                                        <button 
                                            type="button" 
                                            onClick={() => addArrayItem('skills')} 
                                            className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-dashed border-blue-200 hover:border-blue-300 w-full justify-center"
                                        >
                                            + Add New Skill
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
                                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Certifications</h3>
                                    <div className="space-y-3">
                                        {Array.isArray(profile.certifications) && profile.certifications.map((cert, index) => (
                                            <div key={index} className="flex gap-2 items-center group">
                                                <input
                                                    disabled={!isEditing}
                                                    value={cert}
                                                    onChange={(e) => handleArrayChange('certifications', index, e.target.value)}
                                                    className={`border-0 bg-slate-50 rounded-lg p-3 text-sm w-full outline-none font-medium text-slate-700 transition-all ${isEditing ? 'hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 shadow-sm' : ''}`}
                                                    placeholder="Certification Name"
                                                />
                                                {isEditing && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeArrayItem('certifications', index)} 
                                                        className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        x
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {isEditing && (
                                        <button 
                                            type="button" 
                                            onClick={() => addArrayItem('certifications')} 
                                            className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-dashed border-blue-200 hover:border-blue-300 w-full justify-center"
                                        >
                                            + Add Certification
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'private' && (
                        <div className="md:col-span-3 bg-white p-8 rounded-lg border shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Left Column: Personal Info */}
                                <div className="space-y-6">
                                    <div className="flex border-b border-gray-200 pb-1">
                                        <span className="w-1/3 text-gray-600 font-medium">Date of Birth</span>
                                        <input
                                            disabled={!isEditing}
                                            type="date"
                                            value={profile.dob || ''}
                                            onChange={e => handleChange('dob', e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                        />
                                    </div>
                                    <div className="flex border-b border-gray-200 pb-1">
                                        <span className="w-1/3 text-gray-600 font-medium">Residing Address</span>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.address || ''}
                                            onChange={e => handleChange('address', e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                        />
                                    </div>
                                    <div className="flex border-b border-gray-200 pb-1">
                                        <span className="w-1/3 text-gray-600 font-medium">Nationality</span>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.nationality || ''}
                                            onChange={e => handleChange('nationality', e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                        />
                                    </div>
                                    <div className="flex border-b border-gray-200 pb-1">
                                        <span className="w-1/3 text-gray-600 font-medium">Personal Email</span>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.personalEmail || ''}
                                            onChange={e => handleChange('personalEmail', e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                        />
                                    </div>
                                    <div className="flex border-b border-gray-200 pb-1">
                                        <span className="w-1/3 text-gray-600 font-medium">Gender</span>
                                        <select
                                            disabled={!isEditing}
                                            value={profile.gender || ''}
                                            onChange={e => handleChange('gender', e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="flex border-b border-gray-200 pb-1">
                                        <span className="w-1/3 text-gray-600 font-medium">Marital Status</span>
                                        <select
                                            disabled={!isEditing}
                                            value={profile.maritalStatus || ''}
                                            onChange={e => handleChange('maritalStatus', e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                        >
                                            <option value="">Select</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                        </select>
                                    </div>
                                    <div className="flex border-b border-gray-200 pb-1">
                                        <span className="w-1/3 text-gray-600 font-medium">Date of Joining</span>
                                        <div className="flex-1 text-gray-800">{profile.joiningYear || 'N/A'}</div>
                                    </div>
                                </div>

                                {/* Right Column: Bank Details */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 border-b pb-2">Bank Details</h3>
                                    <div className="space-y-6">
                                        <div className="flex border-b border-gray-200 pb-1">
                                            <span className="w-1/3 text-gray-600 font-medium">Account Number</span>
                                            <input
                                                disabled={!isEditing}
                                                value={profile.bankAccount || ''}
                                                onChange={e => handleChange('bankAccount', e.target.value)}
                                                className="flex-1 bg-transparent outline-none text-gray-800"
                                            />
                                        </div>
                                        <div className="flex border-b border-gray-200 pb-1">
                                            <span className="w-1/3 text-gray-600 font-medium">Bank Name</span>
                                            <input
                                                disabled={!isEditing}
                                                value={profile.bankName || ''}
                                                onChange={e => handleChange('bankName', e.target.value)}
                                                className="flex-1 bg-transparent outline-none text-gray-800"
                                            />
                                        </div>
                                        <div className="flex border-b border-gray-200 pb-1">
                                            <span className="w-1/3 text-gray-600 font-medium">IFSC Code</span>
                                            <input
                                                disabled={!isEditing}
                                                value={profile.ifscCode || ''}
                                                onChange={e => handleChange('ifscCode', e.target.value)}
                                                className="flex-1 bg-transparent outline-none text-gray-800"
                                            />
                                        </div>
                                        <div className="flex border-b border-gray-200 pb-1">
                                            <span className="w-1/3 text-gray-600 font-medium">PAN No</span>
                                            <input
                                                disabled={!isEditing}
                                                value={profile.panNo || ''}
                                                onChange={e => handleChange('panNo', e.target.value)}
                                                className="flex-1 bg-transparent outline-none text-gray-800"
                                            />
                                        </div>
                                        <div className="flex border-b border-gray-200 pb-1">
                                            <span className="w-1/3 text-gray-600 font-medium">UAN NO</span>
                                            <input
                                                disabled={!isEditing}
                                                value={profile.uanNo || ''}
                                                onChange={e => handleChange('uanNo', e.target.value)}
                                                className="flex-1 bg-transparent outline-none text-gray-800"
                                            />
                                        </div>
                                        <div className="flex border-b border-gray-200 pb-1">
                                            <span className="w-1/3 text-gray-600 font-medium">Emp Code</span>
                                            <div className="flex-1 text-gray-800">{profile.employeeId || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="md:col-span-3 space-y-6">
                            {/* Provident Fund */}
                            <div className="bg-white p-6 rounded-lg border shadow-sm flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <ShieldCheck size={28} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">Provident Fund (PF) Compliance</h3>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active & Compliant</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Statutory PF Contribution</p>
                                    <p className="text-sm text-gray-500">
                                        As part of your financial security, Emplify automatically processes your Employee Provident Fund (EPF). Both the employee and employer contribute 12% of the basic salary monthly to ensure your long-term savings and pension security.
                                    </p>
                                </div>
                            </div>

                            {/* Health Insurance */}
                            <div className="bg-white p-6 rounded-lg border shadow-sm flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <HeartPulse size={28} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">Corporate Health Insurance</h3>
                                        <span className="text-sm font-bold text-gray-700">₹5,00,000 / Year</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Group Medical Cover</p>
                                    <p className="text-sm text-gray-500">
                                        You are covered under the company’s Group Medical Cover (GMC). This policy provides cashless hospitalization and emergency care for you and your immediate dependents (Spouse + 2 Children).
                                    </p>
                                </div>
                            </div>

                            {/* Data Privacy */}
                            <div className="bg-white p-6 rounded-lg border shadow-sm flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Lock size={28} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Data Privacy & Encryption</h3>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">256-Bit Data Protection</p>
                                    <p className="text-sm text-gray-500">
                                        Your personal data, salary slips, and bank details are encrypted using industry-standard AES-256 encryption. Only you and authorized HR administrators have access to your "Private Info" and "Salary Info" tabs.
                                    </p>
                                </div>
                            </div>

                            {/* POSH */}
                            <div className="bg-white p-6 rounded-lg border shadow-sm flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                        <Scale size={28} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Workplace Safety (POSH)</h3>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Zero-Harassment Policy</p>
                                    <p className="text-sm text-gray-500">
                                        We are committed to providing a safe workplace. Our POSH (Prevention of Sexual Harassment) policy ensures a secure environment for all employees. All grievances are handled with strict confidentiality.
                                    </p>
                                </div>
                            </div>

                            {/* Gratuity */}
                            <div className="bg-white p-6 rounded-lg border shadow-sm flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Briefcase size={28} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Gratuity Benefits</h3>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Terminal Benefits</p>
                                    <p className="text-sm text-gray-500">
                                        In accordance with statutory regulations, you are eligible for Gratuity benefits after 5 years of continuous service. This serves as a reward for your loyalty and long-term service to the organization.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'salary' && showSalaryTab && (
                        <div className="md:col-span-3 bg-white p-6 rounded-lg border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Salary Information</h3>
                                <div className="text-sm bg-gray-100 px-3 py-1 rounded">
                                    Wage Type: <span className="font-semibold">Fixed Wage</span>
                                </div>
                            </div>

                            {validationError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium">
                                    ⚠️ {validationError}
                                </div>
                            )}

                            {/* Wage Configuration */}
                            <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold uppercase text-blue-800 mb-1">Monthly Wage (₹)</label>
                                        <input
                                            type="number"
                                            disabled={!isEditing || !canEditSalary}
                                            value={profile.salaryDetails?.monthlyWage || ''}
                                            onChange={(e) => handleDeepChange('salaryDetails', 'monthlyWage', e.target.value)}
                                            className="text-3xl font-bold bg-transparent border-b-2 border-blue-300 w-full focus:border-blue-600 outline-none text-blue-900 disabled:text-gray-600"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Yearly CTC (Approx)</label>
                                        <div className="text-2xl font-bold text-gray-700">
                                            ₹{((parseFloat(profile.salaryDetails?.monthlyWage) || 0) * 12).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Salary Components Structure */}
                                <div>
                                    <h4 className="font-bold text-gray-700 border-b pb-2 mb-4">Earnings Structure</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-500">
                                                    <th className="font-normal pb-2">Component</th>
                                                    <th className="font-normal pb-2 w-24">Calculation</th>
                                                    <th className="font-normal pb-2 text-right">Amount (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                <tr className="group">
                                                    <td className="py-2 font-medium">Basic Salary</td>
                                                    <td className="py-2">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                disabled={!isEditing || !canEditSalary}
                                                                type="number"
                                                                value={salaryConfig.basicPercent}
                                                                onChange={(e) => handleSalaryConfigChange('basicPercent', e.target.value)}
                                                                className="w-12 border rounded px-1 text-center bg-gray-50 disabled:bg-transparent"
                                                            />
                                                            <span>% of Wage</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-right font-mono">{calculatedSalary.basic?.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 font-medium">House Rent Allowance (HRA)</td>
                                                    <td className="py-2">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                disabled={!isEditing || !canEditSalary}
                                                                type="number"
                                                                value={salaryConfig.hraPercentOfBasic}
                                                                onChange={(e) => handleSalaryConfigChange('hraPercentOfBasic', e.target.value)}
                                                                className="w-12 border rounded px-1 text-center bg-gray-50 disabled:bg-transparent"
                                                            />
                                                            <span>% of Basic</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-right font-mono">{calculatedSalary.hra?.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 font-medium">Standard Allowance</td>
                                                    <td className="py-2">
                                                        <input
                                                            disabled={!isEditing || !canEditSalary}
                                                            type="number"
                                                            value={salaryConfig.standardAllowance}
                                                            onChange={(e) => handleSalaryConfigChange('standardAllowance', e.target.value)}
                                                            className="w-20 border rounded px-1 bg-gray-50 disabled:bg-transparent"
                                                        />
                                                        <span className="ml-1 text-xs">Fixed</span>
                                                    </td>
                                                    <td className="py-2 text-right font-mono">{calculatedSalary.stdAlloc?.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 font-medium">Performance Bonus</td>
                                                    <td className="py-2">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                disabled={!isEditing || !canEditSalary}
                                                                type="number"
                                                                value={salaryConfig.performanceBonusPercent}
                                                                onChange={(e) => handleSalaryConfigChange('performanceBonusPercent', e.target.value)}
                                                                className="w-14 border rounded px-1 text-center bg-gray-50 disabled:bg-transparent"
                                                            />
                                                            <span>% of Wage</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-right font-mono">{calculatedSalary.perfBonus?.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 font-medium">Leave Travel Allowance</td>
                                                    <td className="py-2">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                disabled={!isEditing || !canEditSalary}
                                                                type="number"
                                                                value={salaryConfig.ltaPercent}
                                                                onChange={(e) => handleSalaryConfigChange('ltaPercent', e.target.value)}
                                                                className="w-14 border rounded px-1 text-center bg-gray-50 disabled:bg-transparent"
                                                            />
                                                            <span>% of Wage</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-right font-mono">{calculatedSalary.lta?.toLocaleString()}</td>
                                                </tr>
                                                <tr className="bg-gray-50">
                                                    <td className="py-2 font-medium text-blue-800">Fixed Allowance (Balancer)</td>
                                                    <td className="py-2 text-xs text-gray-500 italic">Remaining Amount</td>
                                                    <td className="py-2 text-right font-bold text-blue-800 font-mono">{calculatedSalary.fixedAllowance?.toLocaleString()}</td>
                                                </tr>
                                                <tr className="border-t-2 border-gray-300">
                                                    <td colSpan="2" className="py-3 font-bold text-gray-900">Gross Earnings</td>
                                                    <td className="py-3 text-right font-bold text-gray-900 text-lg">₹{(parseFloat(profile.salaryDetails?.monthlyWage) || 0).toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div>
                                    <h4 className="font-bold text-gray-700 border-b pb-2 mb-4">Statutory Deductions</h4>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500">
                                                <th className="font-normal pb-2">Deduction</th>
                                                <th className="font-normal pb-2 w-24">Rate</th>
                                                <th className="font-normal pb-2 text-right">Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="py-2 font-medium">Provident Fund (PF)</td>
                                                <td className="py-2">
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            disabled={!isEditing || !canEditSalary}
                                                            type="number"
                                                            value={salaryConfig.pfRate}
                                                            onChange={(e) => handleSalaryConfigChange('pfRate', e.target.value)}
                                                            className="w-12 border rounded px-1 text-center bg-gray-50 disabled:bg-transparent"
                                                        />
                                                        <span>% of Basic</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 text-right font-mono text-red-600">-{calculatedSalary.pf?.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 font-medium">Professional Tax</td>
                                                <td className="py-2">
                                                    <input
                                                        disabled={!isEditing || !canEditSalary}
                                                        type="number"
                                                        value={salaryConfig.professionalTax}
                                                        onChange={(e) => handleSalaryConfigChange('professionalTax', e.target.value)}
                                                        className="w-16 border rounded px-1 bg-gray-50 disabled:bg-transparent"
                                                    />
                                                    <span className="ml-1 text-xs">Fixed</span>
                                                </td>
                                                <td className="py-2 text-right font-mono text-red-600">-{calculatedSalary.pt?.toLocaleString()}</td>
                                            </tr>
                                            <tr className="border-t-2 border-gray-300">
                                                <td colSpan="2" className="py-3 font-bold text-gray-700">Total Deductions</td>
                                                <td className="py-3 text-right font-bold text-red-700">₹{calculatedSalary.totalDeductions?.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center">
                                        <div>
                                            <h4 className="text-sm font-bold text-green-800 uppercase">Net Salary (In Hand)</h4>
                                            <p className="text-xs text-green-600">Monthly Wage - Total Deductions</p>
                                        </div>
                                        <div className="text-2xl font-bold text-green-900">
                                            ₹{calculatedSalary.netSalary?.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
