import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import { VicePrincipalLayout } from './VicePrincipalLayout';
import { VicePrincipalStats } from './VicePrincipalStats';
import { ApprovalsModule } from './ApprovalsModule';
import { SubstitutionManager } from './SubstitutionManager';
import { IncidentQueue } from './IncidentQueue';
import { TeacherPerformanceTile } from './TeacherPerformanceTile';

type Tab = 'overview' | 'approvals' | 'substitutions' | 'incidents' | 'performance';

export const VicePrincipalDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            <VicePrincipalStats />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('approvals')}>
                <Text style={styles.actionText}>Review Approvals</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('substitutions')}>
                <Text style={styles.actionText}>Manage Substitutions</Text>
              </TouchableOpacity>
            </View>
            <TeacherPerformanceTile />
          </View>
        );
      case 'approvals':
        return <ApprovalsModule />;
      case 'substitutions':
        return <SubstitutionManager />;
      case 'incidents':
        return <IncidentQueue />;
      case 'performance':
        return <TeacherPerformanceTile />;
      default:
        return null;
    }
  };

  const TabButton = ({ id, label }: { id: Tab, label: string }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === id && styles.activeTab]}
      onPress={() => setActiveTab(id)}
    >
      <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <VicePrincipalLayout activeTab={activeTab}>
      <View style={styles.tabsContainer}>
        <TabButton id="overview" label={t('vp_dashboard.tabs.overview')} />
        <TabButton id="approvals" label={t('vp_dashboard.tabs.approvals')} />
        <TabButton id="substitutions" label={t('vp_dashboard.tabs.substitutions')} />
        <TabButton id="incidents" label={t('vp_dashboard.tabs.incidents')} />
      </View>

      <View style={styles.contentArea}>
        {renderContent()}
      </View>
    </VicePrincipalLayout>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    flexWrap: 'wrap',
    gap: 8
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  activeTab: {
    backgroundColor: '#1976d2',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold'
  },
  contentArea: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    elevation: 2
  },
  actionText: {
    color: '#1976d2',
    fontWeight: 'bold'
  }
});
