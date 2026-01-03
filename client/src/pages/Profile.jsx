import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/profileService';
import { getCurrentUser } from '../services/authService';

const Profile = () => {
    const { id } = useParams(); // Get ID from URL if present
    const [activeTab, setActiveTab] = useState('resume');
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const currentUser = getCurrentUser();

    // If ID is in URL, fetch that user. Otherwise fetch 'me'.
    const targetUserId = id || 'me';

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
                <div className="bg-white border rounded-lg shadow-sm mb-6">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold italic">
                            {id ? `${profile.name || 'Employee'}'s Profile` : 'My Profile'}
                        </h2>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:underline">Edit</button>
                        ) : (
                            <div className="space-x-2">
                                <button type="button" onClick={saveProfile} className="text-green-600 hover:underline font-bold">Save</button>
                                <button type="button" onClick={() => { setIsEditing(false); fetchProfile(); }} className="text-red-500 hover:underline">Cancel</button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center justify-center md:col-span-1">
                            <div className="w-32 h-32 rounded-full bg-pink-300 flex items-center justify-center relative mb-4">
                                <span className="text-4xl text-white">✏️</span>
                                {isEditing && (
                                    <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border shadow cursor-pointer">
                                        <span className="text-xs">📷</span>
                                    </div>
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
                        <div className="md:col-span-2 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Login ID</span>
                                <span className="font-medium">{profile.employeeId || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Company</span>
                                <span className="font-medium">{profile.companyName || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Email</span>
                                <span className="font-medium">{profile.email || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Department</span>
                                <input
                                    disabled={!isEditing || !canEditSalary} // Admin/HR only
                                    value={profile.department || ''}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing && canEditSalary ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>

                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Mobile</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Manager</span>
                                <input
                                    disabled={!isEditing || !canEditSalary}
                                    value={profile.manager || ''}
                                    onChange={(e) => handleChange('manager', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing && canEditSalary ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>

                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Location</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.location || ''}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-6 border-b overflow-x-auto">
                        {['Resume', 'Private Info', 'Salary Info', 'Security'].map(tab => {
                            const tabKey = tab.toLowerCase().replace(' ', '');
                            const realKey = tab === 'Salary Info' ? 'salary' : tab === 'Private Info' ? 'private' : tab.toLowerCase();

                            if (realKey === 'salary' && !showSalaryTab) return null;

                            return (
                                <button
                                    key={realKey}
                                    onClick={() => setActiveTab(realKey)}
                                    className={`py-2 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === realKey ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
                                <div className="bg-white p-4 rounded-lg border shadow-sm h-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold italic">About</h3>
                                    </div>
                                    <textarea
                                        disabled={!isEditing}
                                        value={profile.about || ''}
                                        onChange={(e) => handleChange('about', e.target.value)}
                                        className="w-full h-32 text-sm text-gray-600 resize-none outline-none border-none bg-transparent"
                                        placeholder="Brief description about yourself..."
                                    />

                                    <div className="mt-6">
                                        <h3 className="font-semibold italic mb-2">My interests and hobbies</h3>
                                        <textarea
                                            disabled={!isEditing}
                                            value={profile.interests || ''}
                                            onChange={(e) => handleChange('interests', e.target.value)}
                                            className="w-full h-24 text-sm text-gray-600 resize-none outline-none border-none bg-transparent"
                                            placeholder="Interests..."
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-semibold italic mb-2">What I love about my job</h3>
                                        <textarea
                                            disabled={!isEditing}
                                            value={profile.loveJob || ''}
                                            onChange={(e) => handleChange('loveJob', e.target.value)}
                                            className="w-full h-24 text-sm text-gray-600 resize-none outline-none border-none bg-transparent"
                                            placeholder="..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Skills, Certification */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="font-semibold border-b pb-2 mb-2">Skills</h3>
                                    <div className="space-y-2">
                                        {Array.isArray(profile.skills) && profile.skills.map((skill, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={skill}
                                                    onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                                                    className="border p-1 text-sm w-full rounded focus:border-blue-500 outline-none"
                                                    placeholder="Skill name"
                                                />
                                                {isEditing && <button type="button" onClick={() => removeArrayItem('skills', index)} className="text-red-500">x</button>}
                                            </div>
                                        ))}
                                        {isEditing && <button type="button" onClick={() => addArrayItem('skills')} className="text-sm text-blue-500 hover:underline">+ Add Skills</button>}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="font-semibold border-b pb-2 mb-2">Certification</h3>
                                    <div className="space-y-2">
                                        {Array.isArray(profile.certifications) && profile.certifications.map((cert, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={cert}
                                                    onChange={(e) => handleArrayChange('certifications', index, e.target.value)}
                                                    className="border p-1 text-sm w-full rounded focus:border-blue-500 outline-none"
                                                    placeholder="Certification name"
                                                />
                                                {isEditing && <button type="button" onClick={() => removeArrayItem('certifications', index)} className="text-red-500">x</button>}
                                            </div>
                                        ))}
                                        {isEditing && <button type="button" onClick={() => addArrayItem('certifications')} className="text-sm text-blue-500 hover:underline">+ Add Certification</button>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'private' && (
                        <div className="md:col-span-3 bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Private Information</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-500">Address</label>
                                    <input
                                        disabled={!isEditing}
                                        value={profile.address || ''}
                                        onChange={e => handleChange('address', e.target.value)}
                                        className="w-full border-b focus:border-blue-500 outline-none py-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Personal Email</label>
                                    <input
                                        disabled={!isEditing}
                                        value={profile.personalEmail || ''}
                                        onChange={e => handleChange('personalEmail', e.target.value)}
                                        className="w-full border-b focus:border-blue-500 outline-none py-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Bank Account Number</label>
                                    <input
                                        disabled={!isEditing}
                                        value={profile.bankAccount || ''}
                                        onChange={e => handleChange('bankAccount', e.target.value)}
                                        className="w-full border-b focus:border-blue-500 outline-none py-1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="md:col-span-3 bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                            <p className="text-gray-500">Password reset and 2FA settings would go here.</p>
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
