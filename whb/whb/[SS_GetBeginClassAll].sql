USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SS_GetBeginClassAll]    Script Date: 2015/1/6 16:53:09 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO






CREATE procedure [dbo].[SS_GetBeginClassAll]
@SqlWhere varchar(max)
as
Declare @sql nvarchar(max)

	set @sql='If(object_id(''tempdb.dbo.#Temp'') Is Not Null) Drop Table #Temp;'
	set @sql =@sql + '
	Select 
	FactClassSN,
	[Day] as ����,
	FactClassName as �����,
	Convert(varchar(8),FCTime) as �ܿ�ʱ,
	ClassRoomName as ������,
	StartTime as ��ʼʱ��,
	EndTime as ����ʱ��,
	Course as �γ���,
	TeacherName as ��ʦ��,
	Convert(varchar(8),DeductionCTime) as ��ʱ,
	Case State When 0 Then ''����'' When -1 Then ''ȱ��'' When 1 Then ''����'' End as ״̬
	INTO #Temp
	from (
		Select 
		FactClass.FactClassSN,
		BeginClass.[Day],
		FactClass.FactClassName,
		FactClass.FCTime,
		ClassRoom.ClassRoomName,
		Teacher.TeacherName,
		BeginClass.SettlementState,
		BeginClass.State,
		dbo.F_INT_TIME(BeginClass.StartTime) as StartTime,
		dbo.F_INT_TIME(BeginClass.EndTime) as EndTime,
		DeductionCTime,
		Branch.BranchSN,
		Branch.SchoolSN,
		Course 
		From BeginClass  Join FactClass On FactClass.FactClassSN=BeginClass.FactClassSN 
		Join ClassRoom On ClassRoom.ClassRoomSN=BeginClass.ClassRoomSN
		Join Teacher On Teacher.TeacherSN=BeginClass.TeacherSN 
		inner join Branch on Branch.BranchSN=FactClass.BranchSN 
		where BeginClass.DEL=0 
	) as BeginClass where 1=1 '+ @SqlWhere +'

	Select 
	����,
    �����, 
    �ܿ�ʱ,
	������,
	��ʼʱ��,
	����ʱ��,
	�γ���,
	��ʦ��,
	��ʱ,
	״̬
	From tempdb.dbo.#Temp'

	exec sp_executesql @sql






GO


