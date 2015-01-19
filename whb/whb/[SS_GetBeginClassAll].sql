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
	[Day] as 日期,
	FactClassName as 物理班,
	Convert(varchar(8),FCTime) as 总课时,
	ClassRoomName as 教室名,
	StartTime as 开始时间,
	EndTime as 结束时间,
	Course as 课程名,
	TeacherName as 教师名,
	Convert(varchar(8),DeductionCTime) as 课时,
	Case State When 0 Then ''正常'' When -1 Then ''缺课'' When 1 Then ''补课'' End as 状态
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
	日期,
    物理班, 
    总课时,
	教室名,
	开始时间,
	结束时间,
	课程名,
	教师名,
	课时,
	状态
	From tempdb.dbo.#Temp'

	exec sp_executesql @sql






GO


