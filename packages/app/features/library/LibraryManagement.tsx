
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useInteraction } from '../../provider/InteractionContext';
import { SovereignButton, SovereignInput, SovereignTable, SovereignBadge, PageHeader } from '../../components/SovereignComponents';
import { ActionModal } from '../../components/ActionModal';
import { Row, Col } from '../../components/Layout';
import { Plus, BookOpen, RotateCcw } from 'lucide-react';

export const LibraryManagement = () => {
  const { books, students, addBook, issueBook, returnBook } = useInteraction();
  const [returnIsbn, setReturnIsbn] = useState('');

  // Modal States
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);

  // Forms
  const [newBook, setNewBook] = useState({ isbn: '', title: '', author: '' });
  const [issueForm, setIssueForm] = useState({ isbn: '', studentId: '' });

  const handleAddBook = () => {
    if (!newBook.isbn || !newBook.title) return alert("Required fields missing");
    addBook({ ...newBook, status: 'AVAILABLE' });
    setAddModalOpen(false);
    setNewBook({ isbn: '', title: '', author: '' });
  };

  const handleIssueBook = () => {
    if (!issueForm.isbn || !issueForm.studentId) return alert("Select Book and Student");
    issueBook(issueForm.isbn, issueForm.studentId);
    setIssueModalOpen(false);
    setIssueForm({ isbn: '', studentId: '' });
  };

  const handleReturn = () => {
    const book = books.find(b => b.isbn === returnIsbn);
    if (!book) return alert("Book not found");
    if (book.status === 'AVAILABLE') return alert("Book is already available");

    returnBook(returnIsbn);
    alert(`Returned: ${book.title}. No Fine.`);
    setReturnIsbn('');
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Author", accessor: "author" },
    { header: "ISBN", accessor: "isbn" },
    { header: "Issued To", accessor: (row: any) => row.issuedTo ? students.find(s => s.id === row.issuedTo)?.name || row.issuedTo : '-' },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'AVAILABLE' ? 'success' : 'warning'}>{row.status}</SovereignBadge> }
  ];

  const availableBooks = books.filter(b => b.status === 'AVAILABLE');

  // Helper for rendering select lists
  const SelectList = ({ label, items, selectedId, onSelect, displayKey = 'name', idKey = 'id', subKey }: any) => (
    <View className="mb-4">
      <Text className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</Text>
      <ScrollView className="max-h-40 border border-gray-200 rounded-lg">
        {items.map((item: any) => {
          const id = item[idKey];
          return (
            <Pressable
              key={id}
              onPress={() => onSelect(id)}
              className={`p-3 border-b border-gray-100 ${selectedId === id ? 'bg-indigo-50' : 'bg-white'}`}
            >
              <Text className={`text-sm ${selectedId === id ? 'text-indigo-700 font-bold' : 'text-gray-700'}`}>
                {item[displayKey]} {subKey && `(${item[subKey]})`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        <PageHeader
          title="Library Circulation"
          subtitle="Catalog & Issue Desk"
          action={
            <View className="flex-row gap-2">
              <SovereignButton variant="secondary" icon={<BookOpen className="w-4 h-4" />} onClick={() => setIssueModalOpen(true)}>Issue Book</SovereignButton>
              <SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>Add Book</SovereignButton>
            </View>
          }
        />

        <Row>
          <Col className="w-full lg:w-1/3">
            <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full space-y-4">
              <Text className="font-bold text-gray-800 flex-row items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-600" /> <Text>Return Processor</Text>
              </Text>
              <SovereignInput label="Scan ISBN" value={returnIsbn} onChangeText={setReturnIsbn} placeholder="e.g. 978-01" />
              <View className="mt-4">
                <SovereignButton onClick={handleReturn} className="w-full">
                  Process Return
                </SovereignButton>
              </View>
            </View>
          </Col>

          <Col className="w-full lg:w-2/3">
            <View className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
              <SovereignTable data={books} columns={columns} />
            </View>
          </Col>
        </Row>

        {/* MODAL: Add Book */}
        <ActionModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add New Book"
          onConfirm={handleAddBook}
          confirmLabel="Add to Inventory"
        >
          <View className="space-y-4">
            <SovereignInput label="Book Title" value={newBook.title} onChangeText={t => setNewBook({ ...newBook, title: t })} />
            <SovereignInput label="Author" value={newBook.author} onChangeText={t => setNewBook({ ...newBook, author: t })} />
            <SovereignInput label="ISBN / Barcode" value={newBook.isbn} onChangeText={t => setNewBook({ ...newBook, isbn: t })} />
          </View>
        </ActionModal>

        {/* MODAL: Issue Book */}
        <ActionModal
          isOpen={isIssueModalOpen}
          onClose={() => setIssueModalOpen(false)}
          title="Issue Book to Student"
          onConfirm={handleIssueBook}
          confirmLabel="Confirm Issue"
        >
          <View className="space-y-4">
            {/* Book Select */}
            <SelectList
              label="Select Book"
              items={availableBooks}
              selectedId={issueForm.isbn}
              onSelect={(id: string) => setIssueForm({ ...issueForm, isbn: id })}
              displayKey="title"
              idKey="isbn"
              subKey="isbn"
            />

            {/* Student Select */}
            <SelectList
              label="Select Student"
              items={students}
              selectedId={issueForm.studentId}
              onSelect={(id: string) => setIssueForm({ ...issueForm, studentId: id })}
              displayKey="name"
              subKey="class"
            />
          </View>
        </ActionModal>
      </View>
    </ScrollView>
  );
};
